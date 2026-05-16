import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { postConversion, RdStationError } from '@/lib/rd-station/client';
import { checkRateLimit } from '@/lib/rate-limit/in-memory';
import { saveLead, recordEvent, type StoredLead } from '@/lib/leads/store';
import {
  buildUserData,
  readCapiConfig,
  sendCapiEvent,
} from '@/lib/meta-capi/client';
import {
  normalizeWhatsappToE164,
  WHATSAPP_BR_REGEX,
} from '@/lib/validation/schemas';
import { getPlanById, type PlanId } from '@/lib/plans/catalog';
import type { Tier } from '@/lib/quiz/types';

export const runtime = 'nodejs';

/**
 * Rota dedicada pra leads da LP /oferta.
 *
 * Diferenças da /api/leads (do quiz):
 *   - Schema mais leve: só name + whatsapp + email + consent + selectedPlan
 *   - Sem score/breakdown/answers (não fez quiz)
 *   - tier derivado do plano selecionado (mapping abaixo)
 *   - Conversion identifier no RD: `jofipet-oferta-{plan}` em vez de
 *     `jofipet-quiz-{tier}` — permite segmentar campanhas/listas por origem
 *   - Tags: ['lead-oferta-lp', 'plano-{plan}'] em vez de tier
 *
 * Mantém TODOS os outros sistemas iguais:
 *   - Rate limit por IP
 *   - Vercel KV (lead persiste 30d)
 *   - Meta CAPI Lead com EAQ alto (email + whatsapp + nome hasheados)
 *   - Admin panel reconhece o lead automaticamente
 */

// Plano selecionado → tier derivado (pra Pixel value, KV stats, etc).
// Sem plano (CTA genérico tipo Hero/MidCta) → default 'morno' (Sereno).
const PLAN_TO_TIER: Record<PlanId, Tier> = {
  sereninho: 'frio',
  sereno: 'morno',
  parceiro: 'quente',
  'melhor-amigo': 'quente',
};

const TIER_LEAD_VALUE: Record<Tier, number> = {
  quente: 89.9,
  morno: 49.9,
  frio: 0,
};

const OfertaLeadSchema = z.object({
  name: z.string().min(2).max(80),
  whatsapp: z.string().regex(WHATSAPP_BR_REGEX),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  consent: z.literal(true),
  /** Plano clicado pelo usuário (vem dos cards). Vazio = CTA genérico. */
  selectedPlanId: z
    .enum(['sereninho', 'sereno', 'parceiro', 'melhor-amigo'])
    .optional(),
  /** Posição do CTA pra granularidade de tracking (hero/mid/final/sticky/card). */
  source: z
    .enum(['hero', 'mid', 'final', 'sticky', 'card'])
    .optional(),
  utms: z
    .object({
      utm_source: z.string().optional(),
      utm_medium: z.string().optional(),
      utm_campaign: z.string().optional(),
      utm_content: z.string().optional(),
      utm_term: z.string().optional(),
    })
    .partial()
    .optional(),
});

type OfertaLeadPayload = z.infer<typeof OfertaLeadSchema>;

function extractIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function newCorrelationId(): string {
  return `oferta_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function logJson(
  level: 'info' | 'warn' | 'error',
  record: Record<string, unknown>,
) {
  const line = JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    ...record,
  });
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.warn(line);
  }
}

/**
 * Dispara Lead via Meta CAPI (server-side). Mesmo padrão de /api/leads.
 * EventID determinístico = leadId garante dedup com Pixel client.
 */
async function fireCapiLeadEvent(args: {
  lead: OfertaLeadPayload;
  leadId: string;
  tier: Tier;
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
        content_name: `oferta_lp_${args.lead.selectedPlanId ?? 'generic'}`,
        value: TIER_LEAD_VALUE[args.tier],
        currency: 'BRL',
        source_variant: 'oferta_lp',
        source_position: args.lead.source ?? 'unknown',
      },
    });

    logJson(result.ok ? 'info' : 'warn', {
      event: 'capi_oferta_lead_sent',
      leadId: args.leadId,
      tier: args.tier,
      plan: args.lead.selectedPlanId ?? null,
      ok: result.ok,
      status: result.status,
    });
  } catch (err) {
    logJson('error', {
      event: 'capi_oferta_lead_unexpected_error',
      leadId: args.leadId,
      message: err instanceof Error ? err.message : 'unknown',
    });
  }
}

export async function POST(request: NextRequest) {
  const correlationId = newCorrelationId();
  const ip = extractIp(request);

  // Rate limit (mesma janela que /api/leads)
  const rl = checkRateLimit(`rate:oferta:${ip}`);
  if (!rl.allowed) {
    logJson('warn', { event: 'oferta_rate_limit_hit', correlationId, ip });
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

  const validation = OfertaLeadSchema.safeParse(parsedBody);
  if (!validation.success) {
    logJson('warn', {
      event: 'oferta_payload_invalid',
      correlationId,
      errors: validation.error.flatten(),
    });
    return NextResponse.json(
      { success: false, reason: 'payload_invalid', correlationId },
      { status: 400 },
    );
  }

  const lead = validation.data;
  const leadId = correlationId;
  const tier: Tier = lead.selectedPlanId
    ? PLAN_TO_TIER[lead.selectedPlanId]
    : 'morno'; // fallback genérico
  const userAgent = request.headers.get('user-agent') ?? '';
  const sourceUrl =
    request.headers.get('referer') ?? `${request.nextUrl.origin}/oferta`;

  // Constrói lead pro store (formato compatível com /api/leads pra reusar admin)
  const baseStored: Omit<StoredLead, 'rdStatus' | 'rdWarning'> = {
    leadId,
    correlationId,
    capturedAt: Date.now(),
    ip,
    tier,
    score: 0, // sem quiz
    variant: 'oferta_lp',
    payload: {
      name: lead.name,
      whatsapp: lead.whatsapp,
      email: lead.email,
      consent: true,
      tier,
      score: 0,
      breakdown: { pet_ativo: 0, gasto: 0, dor: 0, cobertura: 0 },
      // answers carrega meta-data da LP /oferta pra debug/segmentação
      answers: {
        source_variant: 'oferta_lp',
        source_position: lead.source ?? 'unknown',
        selected_plan: lead.selectedPlanId ?? 'none',
      },
      utms: lead.utms,
    },
  };

  // === RD Station ===
  // Conversion identifier diferenciado pra segmentação no painel RD
  const rdToken = process.env.RD_STATION_PUBLIC_TOKEN;

  const fireCapi = () =>
    fireCapiLeadEvent({
      lead,
      leadId,
      tier,
      ip,
      userAgent,
      sourceUrl,
    });

  if (!rdToken) {
    logJson('warn', {
      event: 'oferta_rd_token_missing',
      correlationId,
      tier,
    });
    await saveLead({ ...baseStored, rdStatus: 'token_missing' });
    await recordEvent({
      type: 'lead_captured',
      tier,
      utmSource: lead.utms?.utm_source,
      variant: 'oferta_lp',
      payload: { leadId, source: 'oferta_lp', rdStatus: 'token_missing' },
    });
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

  const planLabel = lead.selectedPlanId
    ? getPlanById(lead.selectedPlanId)?.name
    : null;
  const utmFields = lead.utms
    ? Object.fromEntries(
        Object.entries(lead.utms)
          .filter(([, v]) => typeof v === 'string' && v.length > 0)
          .map(([k, v]) => [`cf_${k}`, v as string]),
      )
    : {};

  const conversionId = lead.selectedPlanId
    ? `jofipet-oferta-${lead.selectedPlanId}`
    : 'jofipet-oferta-lp';

  try {
    const rdResult = await postConversion(
      rdToken,
      {
        event_type: 'CONVERSION',
        event_family: 'CDP',
        payload: {
          conversion_identifier: conversionId,
          email: lead.email ?? `${normalizeWhatsappToE164(lead.whatsapp).replace('+', '')}@noemail.jofi.pet`,
          name: lead.name,
          mobile_phone: normalizeWhatsappToE164(lead.whatsapp),
          tags: [
            'quiz-jofipet',
            'lead-oferta-lp',
            ...(lead.selectedPlanId ? [`plano-${lead.selectedPlanId}`] : []),
          ],
          cf_origem: 'oferta_lp',
          cf_quiz_tier: tier,
          cf_quiz_score: 0,
          ...(planLabel ? { cf_plano_interesse: planLabel } : {}),
          ...(lead.source ? { cf_cta_position: lead.source } : {}),
          ...utmFields,
        },
      },
      correlationId,
    );

    if (rdResult.ok) {
      logJson('info', {
        event: 'oferta_rd_success',
        correlationId,
        tier,
        plan: lead.selectedPlanId ?? null,
      });
      await saveLead({ ...baseStored, rdStatus: 'sent' });
      await recordEvent({
        type: 'lead_captured',
        tier,
        utmSource: lead.utms?.utm_source,
        payload: { leadId, source: 'oferta_lp', rdStatus: 'sent' },
      });
      await fireCapi();
      return NextResponse.json({ success: true, leadId, correlationId });
    }

    logJson('error', {
      event: rdResult.status >= 500 ? 'oferta_rd_5xx' : 'oferta_rd_4xx',
      correlationId,
      status: rdResult.status,
      body: rdResult.body,
    });
    const rdStatus = rdResult.status >= 500 ? 'queued' : 'rejected';
    const warning = rdStatus === 'queued' ? 'rd_5xx_queued' : 'rd_rejected';
    await saveLead({ ...baseStored, rdStatus, rdWarning: warning });
    await recordEvent({
      type: 'lead_captured',
      tier,
      utmSource: lead.utms?.utm_source,
      variant: 'oferta_lp',
      payload: { leadId, source: 'oferta_lp', rdStatus },
    });
    await fireCapi();
    return NextResponse.json(
      { success: true, leadId, correlationId, warning },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof RdStationError) {
      logJson('error', {
        event: 'oferta_rd_unreachable',
        correlationId,
        status: err.status,
        message: err.message,
      });
      await saveLead({
        ...baseStored,
        rdStatus: 'unreachable',
        rdWarning: 'rd_unreachable_queued',
      });
      await recordEvent({
        type: 'lead_captured',
        tier,
        utmSource: lead.utms?.utm_source,
        payload: { leadId, source: 'oferta_lp', rdStatus: 'unreachable' },
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
