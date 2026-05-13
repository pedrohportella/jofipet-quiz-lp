import type { LeadPayload } from '@/lib/validation/schemas';
import type { Tier } from '@/lib/quiz/types';

/**
 * Lead persistence layer with in-memory MVP + Vercel KV plug-and-play.
 *
 * Today: stores in Map (lives while serverless function is warm; ~5-15min idle TTL).
 * Tomorrow: when `KV_REST_API_URL` env is set (Vercel KV connected), this transparently
 * switches to KV-backed storage without callsite changes.
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

function isKvEnabled(): boolean {
  return typeof process.env.KV_REST_API_URL === 'string' && process.env.KV_REST_API_URL.length > 0;
}

export async function saveLead(lead: StoredLead): Promise<void> {
  if (isKvEnabled()) {
    // TODO: implementar quando Vercel KV estiver conectado
    // const { kv } = await import('@vercel/kv');
    // await kv.set(`lead:${lead.leadId}`, lead, { ex: 60 * 60 * 24 * 30 });
    // await kv.zadd('leads:by-date', { score: lead.capturedAt, member: lead.leadId });
    // await kv.zadd(`leads:by-tier:${lead.tier}`, { score: lead.capturedAt, member: lead.leadId });
  }
  leadsMemory.set(lead.leadId, lead);
}

export async function listLeads(opts: {
  limit?: number;
  offset?: number;
  tier?: Tier;
  since?: number;
  utmSource?: string;
} = {}): Promise<{ items: StoredLead[]; total: number }> {
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
  return leadsMemory.get(leadId) ?? null;
}

export async function recordEvent(event: Omit<FunnelEventRecord, 'eventId' | 'ts'>): Promise<void> {
  const record: FunnelEventRecord = {
    eventId: `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    ...event,
  };
  eventsMemory.push(record);
  if (eventsMemory.length > MAX_EVENTS) {
    eventsMemory.splice(0, eventsMemory.length - MAX_EVENTS);
  }
  if (isKvEnabled()) {
    // TODO: persistir em KV stream
  }
}

export async function listEvents(opts: { limit?: number; since?: number } = {}): Promise<FunnelEventRecord[]> {
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
  const events = eventsMemory.filter((e) => e.ts >= since);

  const totals: Record<string, number> = {
    quiz_started: 0,
    quiz_complete: 0,
    captura_view: 0,
    lead_captured: 0,
    result_view: 0,
    cta_click: 0,
  };
  for (const e of events) {
    if (e.type in totals) totals[e.type] = (totals[e.type] ?? 0) + 1;
  }

  const leadsArr = Array.from(leadsMemory.values()).filter((l) => l.capturedAt >= since);
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
