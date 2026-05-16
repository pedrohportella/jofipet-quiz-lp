import { NextResponse, type NextRequest } from 'next/server';
import { getFunnelStats } from '@/lib/leads/store';

export const runtime = 'nodejs';

/**
 * Funnel stats com filtros opcionais.
 *
 * Query params:
 *   - `range`: 'today' | '7d' | '30d' | 'all' (default 'all')
 *     Computa o `since` timestamp automaticamente.
 *   - `since`: timestamp custom em ms (override do range — só usar pra debug)
 *
 * Variant filter (Quiz vs Oferta LP) é feito no CLIENT — sempre retornamos
 * `byVariant.quiz` e `byVariant.oferta_lp` no payload, e o dashboard escolhe
 * qual mostrar. Mantém a API simples e cacheável.
 */
function rangeToSince(range: string | null): number | undefined {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  switch (range) {
    case 'today': {
      // Início do dia local (00:00) em ms — Brasil usa UTC-3, mas como o servidor
      // pode estar em UTC, usamos new Date(year, month, day) que dá meia-noite local.
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case '7d':
      return now - 7 * DAY;
    case '30d':
      return now - 30 * DAY;
    case 'all':
    case null:
    case '':
      return undefined;
    default:
      return undefined;
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const rangeParam = url.searchParams.get('range');
  const sinceParam = url.searchParams.get('since');

  // sinceParam tem precedência se passado explicitamente
  const since = sinceParam
    ? Number(sinceParam)
    : rangeToSince(rangeParam);

  const stats = await getFunnelStats({
    since: Number.isFinite(since) ? (since as number) : undefined,
  });
  return NextResponse.json(stats);
}
