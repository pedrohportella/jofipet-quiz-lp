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

export interface StoredLead {
  leadId: string;
  correlationId: string;
  capturedAt: number;
  ip: string | null;
  tier: Tier;
  score: number;
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
    ]);
  } catch (err) {
    safeLog('error', {
      event: 'kv_save_lead_failed',
      leadId: lead.leadId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function listLeads(opts: {
  limit?: number;
  offset?: number;
  tier?: Tier;
  since?: number;
  utmSource?: string;
} = {}): Promise<{ items: StoredLead[]; total: number }> {
  if (isKvEnabled()) {
    try {
      const indexKey = opts.tier ? `leads:by-tier:${opts.tier}` : 'leads:by-date';
      const min = opts.since ?? 0;
      const ids = await kv.zrange(indexKey, min, '+inf', {
        byScore: true,
        rev: true,
        offset: opts.offset ?? 0,
        count: opts.limit ?? 50,
      });
      const total = Number((await kv.zcount(indexKey, min, '+inf')) ?? 0);

      if (Array.isArray(ids) && ids.length > 0) {
        const fetched = await Promise.all(
          ids.map((id) => kv.get<StoredLead>(`lead:${String(id)}`)),
        );
        let items = fetched.filter((l): l is StoredLead => l !== null);
        if (opts.utmSource) {
          items = items.filter((l) => l.payload.utms?.utm_source === opts.utmSource);
        }
        return { items, total };
      }
      return { items: [], total };
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
  if (opts.utmSource) {
    items = items.filter((l) => l.payload.utms?.utm_source === opts.utmSource);
  }
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
    await Promise.all([
      kv.set(`event:${record.eventId}`, record, { ex: EVENT_TTL_SECONDS }),
      kv.zadd('events:by-date', { score: record.ts, member: record.eventId }),
      kv.zadd(`events:by-type:${record.type}`, {
        score: record.ts,
        member: record.eventId,
      }),
    ]);
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
      const ids = await kv.zrange('events:by-date', min, '+inf', {
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

export async function getFunnelStats(opts: { since?: number } = {}): Promise<{
  totals: Record<string, number>;
  byTier: Record<Tier, number>;
  byUtmSource: Record<string, number>;
  conversionRate: {
    quizStartToComplete: number;
    completeToCapture: number;
  };
}> {
  const since = opts.since ?? 0;
  const totals: Record<string, number> = {
    quiz_started: 0,
    quiz_complete: 0,
    captura_view: 0,
    lead_captured: 0,
    result_view: 0,
    cta_click: 0,
  };

  if (isKvEnabled()) {
    try {
      const counts = await Promise.all(
        Object.keys(totals).map((type) =>
          kv.zcount(`events:by-type:${type}`, since, '+inf'),
        ),
      );
      Object.keys(totals).forEach((type, i) => {
        totals[type] = Number(counts[i] ?? 0);
      });
    } catch {
      const events = eventsMemory.filter((e) => e.ts >= since);
      for (const e of events) {
        if (e.type in totals) totals[e.type] = (totals[e.type] ?? 0) + 1;
      }
    }
  } else {
    const events = eventsMemory.filter((e) => e.ts >= since);
    for (const e of events) {
      if (e.type in totals) totals[e.type] = (totals[e.type] ?? 0) + 1;
    }
  }

  const { items: leadsArr } = await listLeads({ since, limit: 10_000 });
  const byTier: Record<Tier, number> = { quente: 0, morno: 0, frio: 0 };
  const byUtmSource: Record<string, number> = {};
  for (const l of leadsArr) {
    byTier[l.tier] = (byTier[l.tier] ?? 0) + 1;
    const src = l.payload.utms?.utm_source ?? '(direto)';
    byUtmSource[src] = (byUtmSource[src] ?? 0) + 1;
  }

  const started = totals.quiz_started ?? 0;
  const completed = totals.quiz_complete ?? 0;
  const captured = totals.lead_captured ?? 0;
  const quizStartToComplete = started > 0 ? completed / started : 0;
  const completeToCapture = completed > 0 ? captured / completed : 0;

  return {
    totals,
    byTier,
    byUtmSource,
    conversionRate: { quizStartToComplete, completeToCapture },
  };
}

export function _resetForTests(): void {
  leadsMemory.clear();
  eventsMemory.splice(0);
}
