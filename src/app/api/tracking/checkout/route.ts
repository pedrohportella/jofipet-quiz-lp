import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  buildUserData,
  readCapiConfig,
  sendCapiEvent,
} from '@/lib/meta-capi/client';
import { getLead } from '@/lib/leads/store';
import { checkRateLimit } from '@/lib/rate-limit/in-memory';

export const runtime = 'nodejs';

/**
 * Server-side CAPI endpoint for InitiateCheckout events.
 *
 * Why this exists: client-side Pixel dispara InitiateCheckout em
 * ResultHot/ResultWarm/SereninhoCta/WhatsappCta, mas ~25-40% dos eventos somem
 * por adblock/iOS ATT. Server-side garante delivery + EAQ alto.
 *
 * Dedup: event_id é gerado client-side determinístico (leadId + context),
 * passado tanto pro Pixel quanto pra essa rota. Meta deduplica automaticamente.
 *
 * Fluxo:
 *   1. Cliente chama fbqTrack('InitiateCheckout', ..., { eventID })
 *   2. Cliente chama POST /api/tracking/checkout com mesmo eventID
 *   3. Server lookup do lead (se leadId presente) pra montar user_data rico
 *   4. Server dispara CAPI InitiateCheckout
 *   5. Meta vê 2 eventos com mesmo event_id → conta 1
 */

const CheckoutSchema = z.object({
  tier: z.enum(['quente', 'morno', 'frio']),
  value: z.number().min(0).max(10000),
  eventId: z.string().min(1).max(200),
  leadId: z.string().max(200).optional(),
  context: z.enum(['view', 'sereninho_click', 'wa_click']).optional(),
  sourceUrl: z.string().url().max(500).optional(),
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

  // Rate limit por IP — evita abuso (em UX normal cada lead dispara 1-3x)
  const rl = checkRateLimit(`rate:checkout:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, reason: 'rate_limited' },
      { status: 429 },
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: 'invalid_json' },
      { status: 400 },
    );
  }

  const validation = CheckoutSchema.safeParse(parsedBody);
  if (!validation.success) {
    return NextResponse.json(
      { ok: false, reason: 'payload_invalid' },
      { status: 400 },
    );
  }
  const data = validation.data;

  const config = readCapiConfig();
  if (!config) {
    // Skip gracioso — não é erro, só não temos CAPI configurado
    return NextResponse.json(
      { ok: true, skipped: 'capi_not_configured' },
      { status: 200 },
    );
  }

  const userAgent = request.headers.get('user-agent') ?? '';

  // User data enrichment: se temos leadId, busca lead salvo pra hash de email/phone/name.
  // Senão: só IP + UA (matching mais fraco, mas server-side sempre tem isso).
  let userData;
  if (data.leadId) {
    try {
      const lead = await getLead(data.leadId);
      if (lead) {
        userData = buildUserData({
          email: lead.payload.email ?? null,
          whatsapp: lead.payload.whatsapp,
          name: lead.payload.name,
          ip,
          userAgent,
        });
      }
    } catch {
      // Swallow lookup failure — vai cair no fallback abaixo
    }
  }
  if (!userData) {
    userData = buildUserData({ ip, userAgent });
  }

  try {
    const result = await sendCapiEvent(config, {
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      event_id: data.eventId,
      action_source: 'website',
      event_source_url:
        data.sourceUrl ?? `${request.nextUrl.origin}/resultado/${data.tier}`,
      user_data: userData,
      custom_data: {
        content_name: data.tier,
        value: data.value,
        currency: 'BRL',
        // context = view/sereninho_click/wa_click — ajuda a entender em qual
        // touchpoint o evento foi disparado (custom report no Events Manager)
        ...(data.context ? { source_context: data.context } : {}),
      },
    });

    // eslint-disable-next-line no-console
    console.warn(
      JSON.stringify({
        level: result.ok ? 'info' : 'warn',
        event: 'capi_ic_sent',
        eventId: data.eventId,
        context: data.context ?? 'view',
        tier: data.tier,
        ok: result.ok,
        status: result.status,
      }),
    );

    return NextResponse.json(
      { ok: result.ok, status: result.status },
      { status: 200 },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'capi_ic_unexpected_error',
        eventId: data.eventId,
        message: err instanceof Error ? err.message : 'unknown',
      }),
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
