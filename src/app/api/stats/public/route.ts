import { NextResponse, type NextRequest } from 'next/server';
import { getFunnelStats } from '@/lib/leads/store';

export const runtime = 'nodejs';

/**
 * Public stats endpoint — exposes ONLY aggregated counters (no PII, no per-lead data).
 * Used by client-side SocialProofBadge for "X tutores fizeram o quiz hoje" social proof.
 * Cache 60s pra reduzir overhead.
 */
export async function GET(_request: NextRequest) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const stats = await getFunnelStats({ since: todayStart.getTime() });

  return NextResponse.json(
    {
      quizStartedToday: stats.totals.quiz_started ?? 0,
      leadsCapturedToday: stats.totals.lead_captured ?? 0,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  );
}
