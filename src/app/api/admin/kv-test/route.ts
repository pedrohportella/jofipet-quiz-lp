import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

/**
 * Admin-only diagnostic endpoint for Vercel KV configuration.
 * Tests round-trip write→read→delete + latency.
 *
 * GET /api/admin/kv-test
 *
 * Response shapes:
 *
 * Not configured:
 *   { configured: false, reason: "env vars missing", details: {...} }
 *
 * Configured + working:
 *   { configured: true, can_write: true, can_read: true, can_delete: true,
 *     match: true, latencyMs: { write, read, delete, total }, ... }
 *
 * Configured + broken (auth/network):
 *   { configured: true, can_write: false, error: "..." }
 */
export async function GET() {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  const kvReadOnly = process.env.KV_REST_API_READ_ONLY_TOKEN;
  const kvLegacy = process.env.KV_URL;

  if (!kvUrl || !kvToken) {
    return NextResponse.json(
      {
        configured: false,
        reason: 'env vars missing',
        details: {
          KV_REST_API_URL: kvUrl ? '<set>' : '<missing>',
          KV_REST_API_TOKEN_set: typeof kvToken === 'string' && kvToken.length > 0,
          KV_REST_API_READ_ONLY_TOKEN_set:
            typeof kvReadOnly === 'string' && kvReadOnly.length > 0,
          KV_URL_set: typeof kvLegacy === 'string' && kvLegacy.length > 0,
        },
      },
      { status: 200 },
    );
  }

  const testKey = `kv-test:${Date.now()}`;
  const testValue = {
    probe: 'jofi-quiz-lp',
    ts: Date.now(),
    nonce: Math.random().toString(36).slice(2, 10),
  };

  const result: Record<string, unknown> = {
    configured: true,
    kvUrlHost: (() => {
      try {
        return new URL(kvUrl).host;
      } catch {
        return '<invalid url>';
      }
    })(),
    can_write: false,
    can_read: false,
    can_delete: false,
    match: false,
    latencyMs: {} as Record<string, number>,
  };

  // 1) Write
  const tStart = Date.now();
  try {
    await kv.set(testKey, testValue, { ex: 60 }); // expira em 60s automaticamente
    result.can_write = true;
    (result.latencyMs as Record<string, number>).write = Date.now() - tStart;
  } catch (err) {
    result.error_write = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json(result, { status: 200 });
  }

  // 2) Read
  const tRead = Date.now();
  try {
    const readBack = await kv.get<typeof testValue>(testKey);
    result.can_read = true;
    (result.latencyMs as Record<string, number>).read = Date.now() - tRead;
    result.readback = readBack;
    result.match =
      readBack !== null &&
      readBack !== undefined &&
      readBack.nonce === testValue.nonce &&
      readBack.ts === testValue.ts;
  } catch (err) {
    result.error_read = err instanceof Error ? err.message : 'unknown';
  }

  // 3) Delete (cleanup, idempotente)
  const tDel = Date.now();
  try {
    await kv.del(testKey);
    result.can_delete = true;
    (result.latencyMs as Record<string, number>).delete = Date.now() - tDel;
  } catch (err) {
    result.error_delete = err instanceof Error ? err.message : 'unknown';
  }

  (result.latencyMs as Record<string, number>).total = Date.now() - tStart;

  return NextResponse.json(result, { status: 200 });
}
