import { NextResponse, type NextRequest } from 'next/server';
import { LeadPayloadSchema } from '@/lib/validation/schemas';
import { buildRdConversionPayload } from '@/lib/rd-station/mapper';
import { postConversion, RdStationError } from '@/lib/rd-station/client';
import { verifyTurnstile } from '@/lib/turnstile/verify';
import { checkRateLimit } from '@/lib/rate-limit/in-memory';
import { saveLead, recordEvent, type StoredLead } from '@/lib/leads/store';
import { checkIdempotency, recordIdempotent } from '@/lib/leads/idempotency';
import {
  buildUserData,
  readCapiConfig,
  sendCapiEvent,
} from '@/lib/meta-capi/client';
import type { Tier } from '@/lib/quiz/types';

export const runtime = 'nodejs';

// Valores aproximados de Lead value por tier (mesmos usados pelo Pixel client
// em InitiateCheckout). Meta usa pra modelagem de qualidade de lead.
const TIER_LEAD_VALUE: Record<Tier, number> = {
  quente: 89.9,
  morno: 49.9,
  frio: 0,
};

/**
 * Dispara o evento Lead via Meta Conversions API (server-side).
 * - SEMPRE tenta enviar, mesmo se RD falhou (lead foi capturado de qualquer jeito).
 * - Usa o `leadId` como `event_id` → Meta deduplica com o Pixel client que envia
 *   o mesmo eventID via trackLead().
 * - Awaitado pra garantir que o lambda da Vercel não morra antes do request
 *   ao Meta completar (custo ~200-400ms na response, OK pra UX).
 * - Erros são absorvidos: CAPI falhar nunca deve quebrar captura de lead.
 */
async function fireCapiLeadEvent(args: {
  lead: {
    name: string;
    whatsapp: string;
    email?: string;
    tier: Tier;
  };
  leadId: string;
  ip: string;
  userAgent: string;
  sourceUrl: string;
  log: (level: 'info' | 'warn' | 'error', record: Record<string, unknown>) => void;
}): Promise<void> {
  const config = readCapiConfig();
  if (!config) {
    args.log('info', {
      event: 'capi_skipped',
      reason: 'env_not_configured',
      leadId: args.leadId,
    });
    return;
  }

  try {
    const result = await sendCapiEvent(config, {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: args.leadId,
      action_source: 'website',
      event_source_url: args.sourceUrl,
      user_data: buildUserData({
        email: args.lead.email ?? null,
        whatsapp: args.lead.whatsapp,
        name: args.lead.name,
        ip: args.ip,
        userAgent: args.userAgent,
      }),
      custom_data: {
        content_name: args.lead.tier,
        value: TIER_LEAD_VALUE[args.lead.tier],
        currency: 'BRL',
      },
    });

    args.log(result.ok ? 'info' : 'warn', {
      event: 'capi_lead_sent',
      leadId: args.leadId,
      ok: result.ok,
      status: result.status,
      ...(result.ok ? {} : { body: result.body }),
    });
  } catch (err) {
    args.log('error', {
      event: 'capi_lead_unexpected_error',
      leadId: args.leadId,
      message: err instanceof Error ? err.message : 'unknown',
    });
  }
}

function extractIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

function newCorrelationId(): string {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function logJson(level: 'info' | 'warn' | 'error', record: Record<string, unknown>) {
  const line = JSON.stringify({ level, timestamp: new Date().toISOString(), ...record });
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(line);
  } else {
    // eslint-disable-next-line no-console
    console.warn(line);
  }
}

export async function POST(request: NextRequest) {
  const correlationId = newCorrelationId();
  const ip = extractIp(request);

  const rl = checkRateLimit(`rate:leads:${ip}`);
  if (!rl.allowed) {
    logJson('warn', { event: 'rate_limit_hit', correlationId, ip });
    return NextResponse.json(
      { success: false, reason: 'rate_limited', correlationId },
      { status: 429, headers: { 'Retry-After': '600' } },
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

  const validation = LeadPayloadSchema.safeParse(parsedBody);
  if (!validation.success) {
    logJson('warn', {
      event: 'payload_invalid',
      correlationId,
      errors: validation.error.flatten(),
    });
    return NextResponse.json(
      { success: false, reason: 'payload_invalid', correlationId },
      { status: 400 },
    );
  }

  const lead = validation.data;

  const cached = checkIdempotency(lead);
  if (cached) {
    logJson('info', {
      event: 'lead_deduplicated',
      correlationId: cached.correlationId,
      originalCorrelationId: correlationId,
    });
    return NextResponse.json(
      {
        success: true,
        leadId: cached.leadId,
        correlationId: cached.correlationId,
        warning: cached.warning ?? 'duplicate_ignored',
      },
      { status: 200 },
    );
  }

  const turnstileResult = await verifyTurnstile(
    lead.turnstileToken,
    ip,
    process.env.TURNSTILE_SECRET_KEY,
  );
  if (!turnstileResult.valid) {
    logJson('warn', {
      event: 'turnstile_failed',
      correlationId,
      reason: turnstileResult.reason,
    });
    return NextResponse.json(
      { success: false, reason: 'turnstile_failed', correlationId },
      { status: 400 },
    );
  }

  const rdToken = process.env.RD_STATION_PUBLIC_TOKEN;
  const leadId = correlationId;
  const userAgent = request.headers.get('user-agent') ?? '';
  const sourceUrl =
    request.headers.get('referer') ??
    `${request.nextUrl.origin}/captura`;

  // Helper local: fecha sobre lead/leadId/contexto pra simplificar callsites.
  const fireCapi = () =>
    fireCapiLeadEvent({
      lead: {
        name: lead.name,
        whatsapp: lead.whatsapp,
        email: lead.email,
        tier: lead.tier,
      },
      leadId,
      ip,
      userAgent,
      sourceUrl,
      log: logJson,
    });

  const baseStored: Omit<StoredLead, 'rdStatus' | 'rdWarning'> = {
    leadId,
    correlationId,
    capturedAt: Date.now(),
    ip,
    tier: lead.tier,
    score: lead.score,
    variant: 'quiz',
    payload: lead,
  };

  if (!rdToken) {
    logJson('warn', {
      event: 'rd_token_missing',
      correlationId,
      tier: lead.tier,
      note: 'Lead aceito mas não enviado ao RD (token não configurado).',
    });
    await saveLead({ ...baseStored, rdStatus: 'token_missing' });
    await recordEvent({
      type: 'lead_captured',
      tier: lead.tier,
      utmSource: lead.utms?.utm_source,
      variant: 'quiz',
      payload: { leadId, rdStatus: 'token_missing' },
    });
    recordIdempotent(lead, { leadId, correlationId, warning: 'rd_token_missing' });
    await fireCapi();
    return NextResponse.json(
      {
        success: true,
        leadId,
        correlationId,
        warning: 'rd_token_missing',
      },
      { status: 200 },
    );
  }

  const rdPayload = buildRdConversionPayload(lead);

  try {
    const rdResult = await postConversion(rdToken, rdPayload, correlationId);

    if (rdResult.ok) {
      logJson('info', {
        event: 'rd_conversion_success',
        correlationId,
        tier: lead.tier,
      });
      await saveLead({ ...baseStored, rdStatus: 'sent' });
      await recordEvent({
        type: 'lead_captured',
        tier: lead.tier,
        utmSource: lead.utms?.utm_source,
        payload: { leadId, rdStatus: 'sent' },
      });
      recordIdempotent(lead, { leadId, correlationId });
      await fireCapi();
      return NextResponse.json({ success: true, leadId, correlationId });
    }

    if (rdResult.status >= 500) {
      logJson('error', {
        event: 'rd_conversion_5xx',
        correlationId,
        status: rdResult.status,
        body: rdResult.body,
      });
      await saveLead({ ...baseStored, rdStatus: 'queued', rdWarning: 'rd_5xx_queued' });
      await recordEvent({
        type: 'lead_captured',
        tier: lead.tier,
        utmSource: lead.utms?.utm_source,
        payload: { leadId, rdStatus: 'queued' },
      });
      await fireCapi();
      return NextResponse.json(
        {
          success: true,
          leadId,
          correlationId,
          warning: 'rd_5xx_queued',
        },
        { status: 200 },
      );
    }

    logJson('error', {
      event: 'rd_conversion_4xx',
      correlationId,
      status: rdResult.status,
      body: rdResult.body,
    });
    await saveLead({ ...baseStored, rdStatus: 'rejected', rdWarning: 'rd_rejected' });
    await recordEvent({
      type: 'lead_captured',
      tier: lead.tier,
      utmSource: lead.utms?.utm_source,
      variant: 'quiz',
      payload: { leadId, rdStatus: 'rejected' },
    });
    await fireCapi();
    return NextResponse.json(
      { success: true, leadId, correlationId, warning: 'rd_rejected' },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof RdStationError) {
      logJson('error', {
        event: 'rd_conversion_exception',
        correlationId,
        status: err.status,
        message: err.message,
      });
      await saveLead({ ...baseStored, rdStatus: 'unreachable', rdWarning: 'rd_unreachable_queued' });
      await recordEvent({
        type: 'lead_captured',
        tier: lead.tier,
        utmSource: lead.utms?.utm_source,
        payload: { leadId, rdStatus: 'unreachable' },
      });
      await fireCapi();
      return NextResponse.json(
        {
          success: true,
          leadId,
          correlationId,
          warning: 'rd_unreachable_queued',
        },
        { status: 200 },
      );
    }
    throw err;
  }
}
