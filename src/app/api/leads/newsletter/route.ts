import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { postConversion, RdStationError } from '@/lib/rd-station/client';
import { checkRateLimit } from '@/lib/rate-limit/in-memory';

export const runtime = 'nodejs';

const NewsletterPayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
  tier: z.enum(['quente', 'morno', 'frio']).optional().nullable(),
  utms: z.record(z.string(), z.string().optional()).optional(),
});

function extractIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function newCorrelationId(): string {
  return `news_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  const correlationId = newCorrelationId();
  const ip = extractIp(request);

  const rl = checkRateLimit(`rate:newsletter:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, reason: 'rate_limited', correlationId },
      { status: 429 },
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, reason: 'invalid_json', correlationId },
      { status: 400 },
    );
  }

  const validation = NewsletterPayloadSchema.safeParse(parsedBody);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, reason: 'payload_invalid', correlationId },
      { status: 400 },
    );
  }

  const lead = validation.data;
  const rdToken = process.env.RD_STATION_PUBLIC_TOKEN;

  if (!rdToken) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'newsletter_no_token',
        correlationId,
      }),
    );
    return NextResponse.json(
      { success: true, correlationId, warning: 'rd_token_missing' },
      { status: 200 },
    );
  }

  const utmFields = lead.utms
    ? Object.fromEntries(
        Object.entries(lead.utms)
          .filter(([, v]) => typeof v === 'string' && v.length > 0)
          .map(([k, v]) => [`cf_${k}`, v as string]),
      )
    : {};

  try {
    const result = await postConversion(
      rdToken,
      {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          conversion_identifier: 'jofipet-newsletter',
          email: lead.email,
          name: lead.name ?? undefined,
          tags: ['newsletter-jofi', 'quiz-jofipet'],
          cf_origem: 'quiz_lp',
          cf_quiz_tier: lead.tier ?? 'frio',
          ...utmFields,
        },
      },
      correlationId,
    );

    if (result.ok) {
      return NextResponse.json({ success: true, correlationId });
    }
    return NextResponse.json(
      { success: true, correlationId, warning: 'rd_non_ok' },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof RdStationError) {
      return NextResponse.json(
        { success: true, correlationId, warning: 'rd_unreachable' },
        { status: 200 },
      );
    }
    throw err;
  }
}
