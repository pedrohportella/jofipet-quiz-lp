import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { postConversion, RdStationError } from '@/lib/rd-station/client';
import { checkRateLimit } from '@/lib/rate-limit/in-memory';
import {
  buildUserData,
  readCapiConfig,
  sendCapiEvent,
} from '@/lib/meta-capi/client';

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

/**
 * Dispara o evento Lead via CAPI também pro newsletter signup.
 * Newsletter signup = mini-lead (sem WhatsApp), mas ainda é lead pra Meta.
 * - Usa email como user_data principal (sem whatsapp/name pra match)
 * - event_id = correlationId (newsletter não tem Pixel client com mesmo ID;
 *   sem dedup mas registra evento server-side)
 */
async function fireCapiNewsletterLead(args: {
  email: string;
  name?: string | null;
  tier?: string | null;
  correlationId: string;
  ip: string;
  userAgent: string;
  sourceUrl: string;
}): Promise<void> {
  const config = readCapiConfig();
  if (!config) return;
  try {
    const result = await sendCapiEvent(config, {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: args.correlationId,
      action_source: 'website',
      event_source_url: args.sourceUrl,
      user_data: buildUserData({
        email: args.email,
        name: args.name ?? null,
        ip: args.ip,
        userAgent: args.userAgent,
      }),
      custom_data: {
        content_name: `newsletter_${args.tier ?? 'unknown'}`,
        value: 0,
        currency: 'BRL',
      },
    });
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        level: result.ok ? 'info' : 'warn',
        event: 'capi_newsletter_sent',
        correlationId: args.correlationId,
        ok: result.ok,
        status: result.status,
      }),
    );
  } catch {
    // Swallow — CAPI failure não pode quebrar newsletter signup
  }
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
  const userAgent = request.headers.get('user-agent') ?? '';
  const sourceUrl =
    request.headers.get('referer') ??
    `${request.nextUrl.origin}/`;

  const fireCapi = () =>
    fireCapiNewsletterLead({
      email: lead.email,
      name: lead.name,
      tier: lead.tier,
      correlationId,
      ip,
      userAgent,
      sourceUrl,
    });

  if (!rdToken) {
    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'newsletter_no_token',
        correlationId,
      }),
    );
    await fireCapi();
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
      await fireCapi();
      return NextResponse.json({ success: true, correlationId });
    }
    await fireCapi();
    return NextResponse.json(
      { success: true, correlationId, warning: 'rd_non_ok' },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof RdStationError) {
      await fireCapi();
      return NextResponse.json(
        { success: true, correlationId, warning: 'rd_unreachable' },
        { status: 200 },
      );
    }
    throw err;
  }
}
