import { kv } from '@vercel/kv';
import type { LeadPayload } from '@/lib/validation/schemas';
import type { Tier } from '@/lib/quiz/types';

/**
 * Lead persistence layer.
 *
 * Strategy: dual-backend. In-memory Map is always written (zero-latency reads
 * while the serverless function is warm). Vercel KV is also written when
 * `KV_REST_API_URL` env is set — gives durability across cold starts and
 * cross-instance reads.
 *
 * Reads prefer KV when configured (cross-instance), fall back to in-memory.
 *
 * KV failures are logged and swallowed so the primary lead capture flow
 * never breaks.
 */

/**
 * Variant identifier — qual fluxo originou o lead/evento.
 * - 'quiz' = funil clássico (/, /quiz/[step], /captura)
 * - 'oferta_lp' = LP long-form direct-response (/oferta)
 *
 * Carregado em todo evento + lead pra A/B comparativo no dashboard.
 * Leads/eventos legados (pré-2026-05-16) podem não ter o campo — tratamos
 * como 'quiz' (default histórico).
 */
export type LeadVariant = 'quiz' | 'oferta_lp';

export interface StoredLead {
  leadId: string;
  correlationId: string;
  capturedAt: number;
  ip: string | null;
  tier: Tier;
  score: number;
  variant: LeadVariant;
  payload: LeadPayload;
  rdStatus: 'sent' | 'queued' | 'rejected' | 'unreachable' | 'token_missing';
  rdWarning?: string;
}

export interface FunnelEventRecord {
  eventId: string;
  ts: number;
  type:
    | 'quiz_started'
    | 'quiz_step_view'
    | 'quiz_complete'
    | 'captura_view'
    | 'lead_captured'
    | 'result_view'
    | 'cta_click';
  tier?: Tier;
  step?: number;
  utmSource?: string;
  variant?: LeadVariant;
  payload?: Record<string, unknown>;
}

const leadsMemory: Map<string, StoredLead> = new Map();
const eventsMemory: FunnelEventRecord[] = [];
const MAX_EVENTS = 10_000;

const LEAD_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const EVENT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function isKvEnabled(): boolean {
  return (
    typeof process.env.KV_REST_API_URL === 'string' &&
    process.env.KV_REST_API_URL.length > 0
  );
}

function safeLog(level: 'warn' | 'error', record: Record<string, unknown>) {
  const line = JSON.stringify({ level, ts: new Date().toISOString(), ...record });
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.warn(line);
  }
}

export async function saveLead(lead: StoredLead): Promise<void> {
  leadsMemory.set(lead.leadId, lead);

  if (!isKvEnabled()) return;
  try {
    await Promise.all([
      kv.set(`lead:${lead.leadId}`, lead, { ex: LEAD_TTL_SECONDS }),
      kv.zadd('leads:by-date', { score: lead.capturedAt, member: lead.leadId }),
      kv.zadd(`leads:by-tier:${lead.tier}`, {
        score: lead.capturedAt,
        member: lead.leadId,
      }),
      kv.zadd(`leads:by-variant:${lead.variant}`, {
        score: lead.capturedAt,
        member: lead.leadId,
      }),
    ]);
  } catch (err) {
    safeLog('error', {
      event: 'kv_save_lead_failed',
      leadId: lead.leadId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Lista leads com filtros opcionais.
 *
 * Filter precedence (afeta qual sorted set do KV usamos como index primário):
 *   1. `tier` → `leads:by-tier:{tier}`
 *   2. `variant` → `leads:by-variant:{variant}`
 *   3. default → `leads:by-date`
 *
 * Filtros adicionais (utmSource, rdStatus, q) são aplicados em memória após
 * o fetch. Funciona pra escala de centenas/milhares de leads — pra >10k,
 * vale revisitar pra indexar mais campos no KV.
 */
export async function listLeads(opts: {
  limit?: number;
  offset?: number;
  tier?: Tier;
  variant?: LeadVariant;
  since?: number;
  until?: number;
  utmSource?: string;
  rdStatus?: StoredLead['rdStatus'];
  q?: string;
} = {}): Promise<{ items: StoredLead[]; total: number }> {
  const matchesFilters = (lead: StoredLead): boolean => {
    if (opts.utmSource && lead.payload.utms?.utm_source !== opts.utmSource) return false;
    if (opts.rdStatus && lead.rdStatus !== opts.rdStatus) return false;
    if (opts.variant && lead.variant !== opts.variant) return false;
    if (opts.until && lead.capturedAt > opts.until) return false;
    if (opts.q) {
      const needle = opts.q.toLowerCase();
      const haystack = [
        lead.payload.name ?? '',
        lead.payload.whatsapp ?? '',
        lead.payload.email ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  };

  if (isKvEnabled()) {
    try {
      // Pick index key by most-selective single-field filter (KV index keys são por tier ou variant).
      const indexKey = opts.tier
        ? `leads:by-tier:${opts.tier}`
        : opts.variant
          ? `leads:by-variant:${opts.variant}`
          : 'leads:by-date';
      const min = opts.since ?? 0;
      // Quando temos secondary filters, precisamos buscar mais ids pra ter "total" preciso pós-filtro.
      const hasSecondaryFilters = !!(
        opts.utmSource || opts.rdStatus || opts.q || opts.until || (opts.variant && opts.tier)
      );
      const fetchCount = hasSecondaryFilters ? 10_000 : opts.limit ?? 50;
      // Redis ZRANGE com BYSCORE + REV: start/stop são INVERTIDOS (start=max, stop=min).
      // https://redis.io/commands/zrange/ — "the start and stop are exchanged when REV is also provided"
      // Sem essa inversão, zrange retorna [] mesmo com zset populado (bug observado em produção).
      const ids = await kv.zrange(indexKey, '+inf', min, {
        byScore: true,
        rev: true,
        offset: hasSecondaryFilters ? 0 : opts.offset ?? 0,
        count: fetchCount,
      });

      if (Array.isArray(ids) && ids.length > 0) {
        const fetched = await Promise.all(
          ids.map((id) => kv.get<StoredLead>(`lead:${String(id)}`)),
        );
        let items = fetched.filter((l): l is StoredLead => l !== null);
        items = items.filter(matchesFilters);
        const total = hasSecondaryFilters
          ? items.length
          : Number((await kv.zcount(indexKey, min, '+inf')) ?? items.length);
        if (hasSecondaryFilters) {
          const offset = opts.offset ?? 0;
          const limit = opts.limit ?? 50;
          items = items.slice(offset, offset + limit);
        }
        return { items, total };
      }
      return { items: [], total: 0 };
    } catch (err) {
      safeLog('error', {
        event: 'kv_list_leads_failed',
        error: err instanceof Error ? err.message : String(err),
      });
      // fall through to in-memory below
    }
  }

  let items = Array.from(leadsMemory.values());
  if (opts.tier) items = items.filter((l) => l.tier === opts.tier);
  if (opts.since) items = items.filter((l) => l.capturedAt >= opts.since!);
  items = items.filter(matchesFilters);
  items.sort((a, b) => b.capturedAt - a.capturedAt);

  const total = items.length;
  const offset = opts.offset ?? 0;
  const limit = opts.limit ?? 50;
  items = items.slice(offset, offset + limit);
  return { items, total };
}

export async function getLead(leadId: string): Promise<StoredLead | null> {
  const local = leadsMemory.get(leadId);
  if (local) return local;
  if (!isKvEnabled()) return null;
  try {
    return await kv.get<StoredLead>(`lead:${leadId}`);
  } catch (err) {
    safeLog('error', {
      event: 'kv_get_lead_failed',
      leadId,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function recordEvent(
  event: Omit<FunnelEventRecord, 'eventId' | 'ts'>,
): Promise<void> {
  const record: FunnelEventRecord = {
    eventId: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    ...event,
  };
  eventsMemory.push(record);
  if (eventsMemory.length > MAX_EVENTS) {
    eventsMemory.splice(0, eventsMemory.length - MAX_EVENTS);
  }
  if (!isKvEnabled()) return;
  try {
    const writes: Promise<unknown>[] = [
      kv.set(`event:${record.eventId}`, record, { ex: EVENT_TTL_SECONDS }),
      kv.zadd('events:by-date', { score: record.ts, member: record.eventId }),
      kv.zadd(`events:by-type:${record.type}`, {
        score: record.ts,
        member: record.eventId,
      }),
    ];
    if (record.variant) {
      writes.push(
        kv.zadd(`events:by-variant:${record.variant}:${record.type}`, {
          score: record.ts,
          member: record.eventId,
        }),
      );
    }
    await Promise.all(writes);
  } catch (err) {
    safeLog('warn', {
      event: 'kv_record_event_failed',
      eventType: record.type,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function listEvents(opts: { limit?: number; since?: number } = {}): Promise<FunnelEventRecord[]> {
  if (isKvEnabled()) {
    try {
      const min = opts.since ?? 0;
      // Redis ZRANGE com BYSCORE + REV exige args invertidos (start=max, stop=min).
      const ids = await kv.zrange('events:by-date', '+inf', min, {
        byScore: true,
        rev: true,
        offset: 0,
        count: opts.limit ?? 200,
      });
      if (Array.isArray(ids) && ids.length > 0) {
        const fetched = await Promise.all(
          ids.map((id) => kv.get<FunnelEventRecord>(`event:${String(id)}`)),
        );
        return fetched.filter((e): e is FunnelEventRecord => e !== null);
      }
      return [];
    } catch (err) {
      safeLog('warn', {
        event: 'kv_list_events_failed',
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  let items = [...eventsMemory];
  if (opts.since) items = items.filter((e) => e.ts >= opts.since!);
  items.sort((a, b) => b.ts - a.ts);
  return items.slice(0, opts.limit ?? 200);
}

const EVENT_TYPES = [
  'quiz_started',
  'quiz_complete',
  'captura_view',
  'lead_captured',
  'result_view',
  'cta_click',
] as const;

type EventType = typeof EVENT_TYPES[number];
type TotalsRecord = Record<EventType, number>;

function emptyTotals(): TotalsRecord {
  return {
    quiz_started: 0,
    quiz_complete: 0,
    captura_view: 0,
    lead_captured: 0,
    result_view: 0,
    cta_click: 0,
  };
}

function emptyByTier(): Record<Tier, number> {
  return { quente: 0, morno: 0, frio: 0 };
}

function computeConversion(totals: TotalsRecord): {
  quizStartToComplete: number;
  completeToCapture: number;
  captureToLead: number;
} {
  const started = totals.quiz_started;
  const completed = totals.quiz_complete;
  const captureView = totals.captura_view;
  const captured = totals.lead_captured;
  return {
    quizStartToComplete: started > 0 ? completed / started : 0,
    completeToCapture: completed > 0 ? captured / completed : 0,
    captureToLead: captureView > 0 ? captured / captureView : 0,
  };
}

interface VariantStats {
  totals: TotalsRecord;
  byTier: Record<Tier, number>;
  byUtmSource: Record<string, number>;
  conversionRate: {
    quizStartToComplete: number;
    completeToCapture: number;
    captureToLead: number;
  };
}

export interface FunnelStatsResult {
  totals: TotalsRecord;
  byTier: Record<Tier, number>;
  byUtmSource: Record<string, number>;
  byVariant: {
    quiz: VariantStats;
    oferta_lp: VariantStats;
  };
  conversionRate: {
    quizStartToComplete: number;
    completeToCapture: number;
    captureToLead: number;
  };
}

/**
 * Funnel stats com breakdown por variant (Quiz vs Oferta LP).
 *
 * Agregação:
 *   - `totals`/`byTier`/`byUtmSource`/`conversionRate` = agregado de TODOS variants (compat com UI existente)
 *   - `byVariant.{quiz,oferta_lp}` = mesmo shape, isolado por origem (pra A/B comparison)
 *
 * Backward compat (legado pré-2026-05-16):
 *   - Leads sem `variant` → contabilizados como 'quiz'
 *   - Events sem `variant` → contabilizados como 'quiz' (calcular como diff total - oferta_lp)
 *
 * Por que essa estratégia pra events: dados legados são quase 100% de tráfego
 * do funil quiz original (LP /oferta foi adicionada depois). Atribuir legados
 * a 'quiz' deixa o card 🧩 Quiz coerente com a contagem de leads. Oferta LP
 * fica zerado pra dados antigos (correto — ela não existia).
 */
export async function getFunnelStats(
  opts: { since?: number } = {},
): Promise<FunnelStatsResult> {
  const since = opts.since ?? 0;

  // Totals agregados (todos variants)
  const totals = emptyTotals();
  const variantTotals: Record<LeadVariant, TotalsRecord> = {
    quiz: emptyTotals(),
    oferta_lp: emptyTotals(),
  };

  if (isKvEnabled()) {
    try {
      // Agregado total: 1 zcount por tipo
      const counts = await Promise.all(
        EVENT_TYPES.map((type) =>
          kv.zcount(`events:by-type:${type}`, since, '+inf'),
        ),
      );
      EVENT_TYPES.forEach((type, i) => {
        totals[type] = Number(counts[i] ?? 0);
      });

      // Por variant: oferta_lp lemos direto; quiz = total - oferta_lp
      // (assim eventos legados sem variant viram 'quiz' por default)
      const ofertaCounts = await Promise.all(
        EVENT_TYPES.map((type) =>
          kv.zcount(`events:by-variant:oferta_lp:${type}`, since, '+inf'),
        ),
      );
      EVENT_TYPES.forEach((type, i) => {
        const oferta = Number(ofertaCounts[i] ?? 0);
        variantTotals.oferta_lp[type] = oferta;
        variantTotals.quiz[type] = Math.max(0, totals[type] - oferta);
      });
    } catch {
      // KV failed → fall back to in-memory aggregation
      const events = eventsMemory.filter((e) => e.ts >= since);
      for (const e of events) {
        if (EVENT_TYPES.includes(e.type as EventType)) {
          totals[e.type as EventType] += 1;
          // Sem variant → 'quiz' (legado default)
          const v: LeadVariant = e.variant ?? 'quiz';
          variantTotals[v][e.type as EventType] += 1;
        }
      }
    }
  } else {
    const events = eventsMemory.filter((e) => e.ts >= since);
    for (const e of events) {
      if (EVENT_TYPES.includes(e.type as EventType)) {
        totals[e.type as EventType] += 1;
        // Sem variant → 'quiz' (legado default)
        const v: LeadVariant = e.variant ?? 'quiz';
        variantTotals[v][e.type as EventType] += 1;
      }
    }
  }

  // Leads agregação (1 fetch, depois bucket por variant)
  const { items: leadsArr } = await listLeads({ since, limit: 10_000 });
  const byTier = emptyByTier();
  const byUtmSource: Record<string, number> = {};
  const variantBuckets: Record<LeadVariant, {
    byTier: Record<Tier, number>;
    byUtmSource: Record<string, number>;
  }> = {
    quiz: { byTier: emptyByTier(), byUtmSource: {} },
    oferta_lp: { byTier: emptyByTier(), byUtmSource: {} },
  };
  for (const l of leadsArr) {
    byTier[l.tier] += 1;
    const src = l.payload.utms?.utm_source ?? '(direto)';
    byUtmSource[src] = (byUtmSource[src] ?? 0) + 1;
    // Leads legados sem variant viram 'quiz' (default histórico)
    const v: LeadVariant = l.variant ?? 'quiz';
    variantBuckets[v].byTier[l.tier] += 1;
    variantBuckets[v].byUtmSource[src] = (variantBuckets[v].byUtmSource[src] ?? 0) + 1;
  }

  return {
    totals,
    byTier,
    byUtmSource,
    conversionRate: computeConversion(totals),
    byVariant: {
      quiz: {
        totals: variantTotals.quiz,
        byTier: variantBuckets.quiz.byTier,
        byUtmSource: variantBuckets.quiz.byUtmSource,
        conversionRate: computeConversion(variantTotals.quiz),
      },
      oferta_lp: {
        totals: variantTotals.oferta_lp,
        byTier: variantBuckets.oferta_lp.byTier,
        byUtmSource: variantBuckets.oferta_lp.byUtmSource,
        conversionRate: computeConversion(variantTotals.oferta_lp),
      },
    },
  };
}

export function _resetForTests(): void {
  leadsMemory.clear();
  eventsMemory.splice(0);
}
