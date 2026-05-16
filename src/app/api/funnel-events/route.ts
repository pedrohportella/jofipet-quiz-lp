import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { recordEvent } from '@/lib/leads/store';
import { checkRateLimit } from '@/lib/rate-limit/in-memory';

export const runtime = 'nodejs';

const EventSchema = z.object({
  type: z.enum([
    'quiz_started',
    'quiz_step_view',
    'quiz_complete',
    'captura_view',
    'result_view',
    'cta_click',
  ]),
  tier: z.enum(['quente', 'morno', 'frio']).optional(),
  step: z.number().int().nonnegative().optional(),
  utmSource: z.string().max(120).optional(),
  variant: z.enum(['quiz', 'oferta_lp']).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

function extractIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  const ip = extractIp(request);
  const rl = checkRateLimit(`rate:events:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, reason: 'rate_limited' }, { status: 429 });
  }

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 });
  }

  const validation = EventSchema.safeParse(parsed);
  if (!validation.success) {
    return NextResponse.json({ ok: false, reason: 'invalid_event' }, { status: 400 });
  }

  await recordEvent(validation.data);
  return NextResponse.json({ ok: true }, { status: 202 });
}
