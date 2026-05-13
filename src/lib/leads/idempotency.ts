import type { LeadPayload } from '@/lib/validation/schemas';

/**
 * Server-side idempotency for /api/leads.
 *
 * Problem: form submit can fire twice (double-click, retry after timeout,
 * resubmit on F5). Each duplicate creates a new RD conversion + admin row
 * inflating the "leads captured" metric.
 *
 * Fix: hash of (whatsapp + tier + bucket-of-30-seconds). If we've seen
 * this same payload within the last 30s, return the cached response
 * instead of processing again.
 */

interface CachedResponse {
  leadId: string;
  correlationId: string;
  warning?: string;
  ts: number;
}

const DEDUPE_WINDOW_MS = 30_000;
const cache: Map<string, CachedResponse> = new Map();

function dedupeKey(payload: LeadPayload): string {
  const bucket = Math.floor(Date.now() / DEDUPE_WINDOW_MS);
  const whatsapp = payload.whatsapp.replace(/\D/g, '');
  return `${whatsapp}:${payload.tier}:${bucket}`;
}

export function checkIdempotency(payload: LeadPayload): CachedResponse | null {
  cleanupExpired();
  const key = dedupeKey(payload);
  return cache.get(key) ?? null;
}

export function recordIdempotent(
  payload: LeadPayload,
  response: { leadId: string; correlationId: string; warning?: string },
): void {
  const key = dedupeKey(payload);
  cache.set(key, { ...response, ts: Date.now() });
}

function cleanupExpired(): void {
  const cutoff = Date.now() - DEDUPE_WINDOW_MS * 2;
  for (const [key, entry] of cache.entries()) {
    if (entry.ts < cutoff) cache.delete(key);
  }
}

export function _resetForTests(): void {
  cache.clear();
}
