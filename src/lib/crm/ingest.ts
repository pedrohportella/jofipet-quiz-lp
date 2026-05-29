/**
 * CRM Ingest — plug paralelo à captura de lead.
 *
 * Espelha o `StoredLead` (que vive no Vercel KV) pro Postgres do Supabase,
 * cria/atualiza a conversation e — opcionalmente — enfileira o disparo
 * automático do HSM de boas-vindas baseado no tier.
 *
 * Política de erro: SEMPRE fail-safe. Qualquer erro aqui apenas loga e
 * retorna `{ ok: false, reason }`. NUNCA propaga pra cima — captura de
 * lead não pode quebrar porque o Supabase ficou indisponível.
 *
 * Idempotência: upsert por `lead_id` (PK). Webhook chegar antes do ingest
 * é coberto: webhook só insere row de mensagem se conversation existir
 * (ou cria conversation "órfã" pra recuperar depois quando o lead chegar).
 */

import { normalizeWhatsappToE164 } from '@/lib/validation/schemas';
import type { StoredLead } from '@/lib/leads/store';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { readWhatsAppConfig, HSM_TEMPLATES_BY_TIER } from '@/lib/whatsapp/config';
import { sendTemplate } from '@/lib/whatsapp/client';

export interface IngestResult {
  ok: boolean;
  reason?:
    | 'crm_disabled'
    | 'db_error'
    | 'hsm_disabled'
    | 'hsm_unconfigured'
    | 'hsm_send_failed';
  conversationId?: string;
  hsmSent?: boolean;
  hsmWaMessageId?: string;
}

function safeLog(level: 'info' | 'warn' | 'error', record: Record<string, unknown>) {
  const line = JSON.stringify({
    component: 'crm_ingest',
    level,
    ts: new Date().toISOString(),
    ...record,
  });
  /* eslint-disable no-console */
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
  /* eslint-enable no-console */
}

/**
 * Converte o WhatsApp do formato local '(11) 99999-9999' pro formato
 * E.164 sem '+' que a Cloud API exige (e que usamos como chave do
 * `crm_conversations.whatsapp_e164`).
 */
function toWaId(local: string): string {
  return normalizeWhatsappToE164(local).replace(/^\+/, '');
}

function shouldFireHsm(): boolean {
  return process.env.CRM_AUTO_HSM_ENABLED === 'true';
}

/**
 * Upsert do lead + conversation. Idempotente.
 * Retorna conversation_id se sucesso.
 */
async function persistLeadAndConversation(
  lead: StoredLead,
  waId: string,
): Promise<{ conversationId: string } | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;

  // 1. Upsert lead
  const leadRow = {
    lead_id: lead.leadId,
    correlation_id: lead.correlationId,
    captured_at: new Date(lead.capturedAt).toISOString(),
    ip: lead.ip,
    tier: lead.tier,
    score: lead.score,
    variant: lead.variant,
    name: lead.payload.name,
    whatsapp_e164: waId,
    email: lead.payload.email ?? null,
    utm_source: lead.payload.utms?.utm_source ?? null,
    utm_medium: lead.payload.utms?.utm_medium ?? null,
    utm_campaign: lead.payload.utms?.utm_campaign ?? null,
    utm_content: lead.payload.utms?.utm_content ?? null,
    utm_term: lead.payload.utms?.utm_term ?? null,
    payload: lead.payload as unknown as Record<string, unknown>,
    rd_status: lead.rdStatus,
    rd_warning: lead.rdWarning ?? null,
  };

  const { error: leadErr } = await supa
    .from('crm_leads')
    .upsert(leadRow, { onConflict: 'lead_id' });
  if (leadErr) {
    safeLog('error', {
      event: 'lead_upsert_failed',
      leadId: lead.leadId,
      error: leadErr.message,
    });
    return null;
  }

  // 2. Busca conversation existente pelo número
  const { data: existingConv, error: convFetchErr } = await supa
    .from('crm_conversations')
    .select('id, lead_id')
    .eq('whatsapp_e164', waId)
    .maybeSingle();
  if (convFetchErr) {
    safeLog('error', {
      event: 'conversation_fetch_failed',
      leadId: lead.leadId,
      error: convFetchErr.message,
    });
    return null;
  }

  if (existingConv) {
    // Atualiza lead_id se for diferente (rara — número reutilizado em nova captura)
    if (existingConv.lead_id !== lead.leadId) {
      const { error: updErr } = await supa
        .from('crm_conversations')
        .update({ lead_id: lead.leadId })
        .eq('id', existingConv.id);
      if (updErr) {
        safeLog('warn', {
          event: 'conversation_lead_relink_failed',
          conversationId: existingConv.id,
          leadId: lead.leadId,
          error: updErr.message,
        });
      }
    }
    return { conversationId: existingConv.id };
  }

  // 3. Cria conversation. Stage default = is_default_entry=true
  const { data: defaultStage } = await supa
    .from('crm_pipeline_stages')
    .select('id')
    .eq('is_default_entry', true)
    .limit(1)
    .maybeSingle();

  const { data: created, error: createErr } = await supa
    .from('crm_conversations')
    .insert({
      lead_id: lead.leadId,
      whatsapp_e164: waId,
      status: 'open',
      pipeline_stage_id: defaultStage?.id ?? null,
    })
    .select('id')
    .single();
  if (createErr || !created) {
    safeLog('error', {
      event: 'conversation_create_failed',
      leadId: lead.leadId,
      error: createErr?.message ?? 'unknown',
    });
    return null;
  }

  return { conversationId: created.id };
}

/**
 * Dispara o HSM correspondente ao tier do lead e persiste a mensagem
 * outbound em crm_messages.
 */
async function dispatchHsm(
  lead: StoredLead,
  waId: string,
  conversationId: string,
): Promise<{ ok: boolean; waMessageId?: string; reason?: string }> {
  const cfg = readWhatsAppConfig();
  if (!cfg) return { ok: false, reason: 'hsm_unconfigured' };

  const supa = getSupabaseAdmin();
  if (!supa) return { ok: false, reason: 'crm_disabled' };

  const template = HSM_TEMPLATES_BY_TIER[lead.tier];
  // 1ª variável do template = primeiro nome (convenção dos 3 templates Jofi)
  const firstName = lead.payload.name.trim().split(/\s+/)[0] ?? lead.payload.name;

  const result = await sendTemplate(cfg, {
    to: waId,
    templateName: template.name,
    language: template.language,
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: firstName }],
      },
    ],
  });

  // Persiste como mensagem outbound — mesmo se falhou, fica registro pra debug
  const baseRow = {
    conversation_id: conversationId,
    direction: 'outbound' as const,
    msg_type: 'template' as const,
    template_name: template.name,
    template_language: template.language,
    template_params: { '1': firstName },
    is_automated: true,
  };

  if (result.ok) {
    await supa.from('crm_messages').insert({
      ...baseRow,
      wa_message_id: result.waMessageId,
      status: 'sent',
      sent_at: new Date().toISOString(),
      raw: result.raw as Record<string, unknown> | null,
    });
    return { ok: true, waMessageId: result.waMessageId };
  }

  await supa.from('crm_messages').insert({
    ...baseRow,
    status: 'failed',
    error_code: result.errorCode ?? null,
    error_title: result.errorTitle ?? null,
    error_details: result.errorMessage ?? null,
    raw: (result.raw as Record<string, unknown> | null) ?? null,
  });
  safeLog('error', {
    event: 'hsm_send_failed',
    leadId: lead.leadId,
    status: result.status,
    code: result.errorCode,
    msg: result.errorMessage,
  });
  return { ok: false, reason: 'hsm_send_failed' };
}

/**
 * Entry point chamado pelo /api/leads/route.ts (e por qualquer outro
 * caminho que persista lead no futuro).
 *
 * Garantia: NUNCA throw. Sempre retorna IngestResult.
 */
export async function crmIngestLead(lead: StoredLead): Promise<IngestResult> {
  const supa = getSupabaseAdmin();
  if (!supa) return { ok: false, reason: 'crm_disabled' };

  const waId = toWaId(lead.payload.whatsapp);

  try {
    const conv = await persistLeadAndConversation(lead, waId);
    if (!conv) return { ok: false, reason: 'db_error' };

    if (!shouldFireHsm()) {
      return {
        ok: true,
        conversationId: conv.conversationId,
        hsmSent: false,
        reason: 'hsm_disabled',
      };
    }

    const hsm = await dispatchHsm(lead, waId, conv.conversationId);
    return {
      ok: true,
      conversationId: conv.conversationId,
      hsmSent: hsm.ok,
      hsmWaMessageId: hsm.waMessageId,
      reason: hsm.ok ? undefined : (hsm.reason as IngestResult['reason']),
    };
  } catch (err) {
    safeLog('error', {
      event: 'ingest_unhandled_exception',
      leadId: lead.leadId,
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, reason: 'db_error' };
  }
}
