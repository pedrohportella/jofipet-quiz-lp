import { NextResponse, type NextRequest } from 'next/server';
import { LeadPayloadSchema } from '@/lib/validation/schemas';
import { buildRdConversionPayload } from '@/lib/rd-station/mapper';
import { postConversion, RdStationError } from '@/lib/rd-station/client';
import { verifyTurnstile } from '@/lib/turnstile/verify';
import { checkRateLimit } from '@/lib/rate-limit/in-memory';
import { saveLead, recordEvent, type StoredLead } from '@/lib/leads/store';

export const runtime = 'nodejs';

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

  const baseStored: Omit<StoredLead, 'rdStatus' | 'rdWarning'> = {
    leadId,
    correlationId,
    capturedAt: Date.now(),
    ip,
    tier: lead.tier,
    score: lead.score,
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
      payload: { leadId, rdStatus: 'token_missing' },
    });
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
      payload: { leadId, rdStatus: 'rejected' },
    });
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
