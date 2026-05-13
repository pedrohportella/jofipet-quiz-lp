import { NextResponse, type NextRequest } from 'next/server';
import { getLead } from '@/lib/leads/store';

export const runtime = 'nodejs';

interface RouteContext {
  params: { leadId: string };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const lead = await getLead(context.params.leadId);
  if (!lead) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(lead);
}
