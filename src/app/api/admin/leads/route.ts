import { NextResponse, type NextRequest } from 'next/server';
import { listLeads } from '@/lib/leads/store';
import type { Tier } from '@/lib/quiz/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tier = (url.searchParams.get('tier') as Tier | null) ?? undefined;
  const utmSource = url.searchParams.get('utmSource') ?? undefined;
  const sinceParam = url.searchParams.get('since');
  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');

  const result = await listLeads({
    tier: tier ?? undefined,
    utmSource: utmSource ?? undefined,
    since: sinceParam ? Number(sinceParam) : undefined,
    limit: limitParam ? Number(limitParam) : undefined,
    offset: offsetParam ? Number(offsetParam) : undefined,
  });

  return NextResponse.json(result);
}
