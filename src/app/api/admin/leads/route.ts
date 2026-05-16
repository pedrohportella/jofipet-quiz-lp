import { NextResponse, type NextRequest } from 'next/server';
import { listLeads, type StoredLead } from '@/lib/leads/store';
import type { Tier } from '@/lib/quiz/types';

export const runtime = 'nodejs';

const VALID_TIERS: Tier[] = ['quente', 'morno', 'frio'];
const VALID_VARIANTS = ['quiz', 'oferta_lp'] as const;
const VALID_RD_STATUS: StoredLead['rdStatus'][] = [
  'sent',
  'queued',
  'rejected',
  'unreachable',
  'token_missing',
];

function parseRange(range: string | null): number | undefined {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  switch (range) {
    case 'today': {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case '7d':
      return now - 7 * DAY;
    case '30d':
      return now - 30 * DAY;
    default:
      return undefined;
  }
}

/**
 * Lista leads com filtros avançados pro painel admin.
 *
 * Query params (todos opcionais):
 *   - `range`: today|7d|30d|all (computa `since`)
 *   - `since`: timestamp ms (override do range)
 *   - `tier`: quente|morno|frio
 *   - `variant`: quiz|oferta_lp
 *   - `rdStatus`: sent|queued|rejected|unreachable|token_missing
 *   - `utmSource`: string
 *   - `q`: busca em name + whatsapp + email (case-insensitive)
 *   - `page`: 1-indexed (default 1)
 *   - `pageSize`: default 50, max 200
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tierParam = url.searchParams.get('tier');
  const variantParam = url.searchParams.get('variant');
  const rdStatusParam = url.searchParams.get('rdStatus');
  const rangeParam = url.searchParams.get('range');
  const sinceParam = url.searchParams.get('since');
  const utmSourceParam = url.searchParams.get('utmSource');
  const qParam = url.searchParams.get('q');
  const pageParam = url.searchParams.get('page');
  const pageSizeParam = url.searchParams.get('pageSize');

  const tier =
    tierParam && VALID_TIERS.includes(tierParam as Tier)
      ? (tierParam as Tier)
      : undefined;
  const variant =
    variantParam &&
    (VALID_VARIANTS as readonly string[]).includes(variantParam)
      ? (variantParam as 'quiz' | 'oferta_lp')
      : undefined;
  const rdStatus =
    rdStatusParam &&
    VALID_RD_STATUS.includes(rdStatusParam as StoredLead['rdStatus'])
      ? (rdStatusParam as StoredLead['rdStatus'])
      : undefined;
  const since = sinceParam ? Number(sinceParam) : parseRange(rangeParam);
  const utmSource = utmSourceParam?.trim() || undefined;
  const q = qParam?.trim() || undefined;

  const page = Math.max(1, pageParam ? Number(pageParam) : 1);
  const pageSize = Math.min(
    200,
    Math.max(1, pageSizeParam ? Number(pageSizeParam) : 50),
  );

  const result = await listLeads({
    tier,
    variant,
    rdStatus,
    since: Number.isFinite(since) ? (since as number) : undefined,
    utmSource,
    q,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const hasMore = page * pageSize < result.total;

  return NextResponse.json({
    ...result,
    page,
    pageSize,
    hasMore,
  });
}
