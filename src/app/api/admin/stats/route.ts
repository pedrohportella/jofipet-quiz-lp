import { NextResponse, type NextRequest } from 'next/server';
import { getFunnelStats } from '@/lib/leads/store';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sinceParam = url.searchParams.get('since');
  const since = sinceParam ? Number(sinceParam) : undefined;
  const stats = await getFunnelStats({ since: Number.isFinite(since!) ? since : undefined });
  return NextResponse.json(stats);
}
