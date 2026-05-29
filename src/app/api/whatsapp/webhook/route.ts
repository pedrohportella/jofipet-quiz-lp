/**
 * WhatsApp Cloud API webhook.
 *
 * Endpoints:
 *   - GET  /api/whatsapp/webhook  → handshake (Meta envia hub.challenge)
 *   - POST /api/whatsapp/webhook  → events (messages, statuses, template updates)
 *
 * Segurança:
 *   - GET valida ?hub.verify_token=… contra META_WEBHOOK_VERIFY_TOKEN
 *   - POST valida X-Hub-Signature-256 com HMAC SHA-256 do raw body
 *
 * Latência:
 *   - Meta espera resposta 200 em <5s. Persistência no Supabase é rápida
 *     (<300ms típico), então fazemos síncrono. Se virar gargalo, mover
 *     pra worker assíncrono via Vercel KV queue.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { readWhatsAppConfig } from '@/lib/whatsapp/config';
import { verifyMetaSignature } from '@/lib/whatsapp/signature';
import {
  parseWebhook,
  type IncomingMessage,
  type StatusEvent,
  type TemplateStatusEvent,
  type ContactProfile,
} from '@/lib/whatsapp/parse-webhook';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function log(level: 'info' | 'warn' | 'error', record: Record<string, unknown>) {
  const line = JSON.stringify({
    component: 'wa_webhook',
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

// =============================================================================
// GET — handshake
// =============================================================================
export function GET(request: NextRequest) {
  const cfg = readWhatsAppConfig();
  if (!cfg) {
    log('warn', { event: 'handshake_skipped', reason: 'config_missing' });
    return new NextResponse('not_configured', { status: 503 });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === cfg.verifyToken && challenge) {
    log('info', { event: 'handshake_ok' });
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  log('warn', { event: 'handshake_rejected', mode });
  return new NextResponse('forbidden', { status: 403 });
}

// =============================================================================
// POST — events
// =============================================================================
export async function POST(request: NextRequest) {
  const cfg = readWhatsAppConfig();
  if (!cfg) {
    // 200 mesmo sem config — não queremos Meta marcar nosso webhook como
    // failing e remover. Logamos pra alertar.
    log('warn', { event: 'post_skipped', reason: 'config_missing' });
    return NextResponse.json({ ok: true, skipped: 'not_configured' });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  const verify = verifyMetaSignature(rawBody, signature, cfg.appSecret);
  if (!verify.ok) {
    log('error', { event: 'signature_invalid', reason: verify.reason });
    return new NextResponse('invalid_signature', { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    log('warn', { event: 'invalid_json' });
    return NextResponse.json({ ok: true, skipped: 'invalid_json' });
  }

  const parsed = parseWebhook(payload);

  // Sanity check: o webhook é do número que esperamos?
  if (parsed.phoneNumberId && parsed.phoneNumberId !== cfg.phoneNumberId) {
    log('warn', {
      event: 'phone_number_mismatch',
      expected: cfg.phoneNumberId,
      got: parsed.phoneNumberId,
    });
    // Não retorna erro — pode ser que tenham mais de um número no WABA.
  }

  const supa = getSupabaseAdmin();
  if (!supa) {
    log('error', {
      event: 'supabase_unavailable',
      messageCount: parsed.messages.length,
      statusCount: parsed.statuses.length,
    });
    // 200 ainda — Meta tenta retry se erro, melhor não criar loop sem persistência.
    return NextResponse.json({ ok: true, skipped: 'db_unavailable' });
  }

  // Processa em paralelo: cada bucket é independente.
  await Promise.allSettled([
    handleIncomingMessages(parsed.messages, parsed.contacts),
    handleStatusEvents(parsed.statuses),
    handleTemplateStatusUpdates(parsed.templateStatusUpdates),
  ]);

  return NextResponse.json({ ok: true });
}

// =============================================================================
// Inbound messages
// =============================================================================
async function handleIncomingMessages(
  messages: IncomingMessage[],
  contacts: ContactProfile[],
): Promise<void> {
  if (messages.length === 0) return;
  const supa = getSupabaseAdmin();
  if (!supa) return;

  const profileByWaId = new Map<string, ContactProfile>();
  for (const c of contacts) profileByWaId.set(c.waId, c);

  for (const m of messages) {
    // 1. Lookup conversation pelo waId (from)
    const { data: conv, error: convErr } = await supa
      .from('crm_conversations')
      .select('id')
      .eq('whatsapp_e164', m.from)
      .maybeSingle();

    let conversationId: string | null = conv?.id ?? null;

    if (convErr) {
      log('error', {
        event: 'conversation_lookup_failed',
        waMessageId: m.waMessageId,
        from: m.from,
        error: convErr.message,
      });
      continue;
    }

    // 2. Se não tem conversation, é mensagem de número não-lead.
    //    Criamos um lead "órfão" (sem quiz) pra não perder a conversa.
    if (!conversationId) {
      const orphan = await createOrphanLeadAndConversation(
        m.from,
        profileByWaId.get(m.from)?.name ?? null,
      );
      conversationId = orphan;
      if (!conversationId) {
        log('error', {
          event: 'orphan_conversation_creation_failed',
          waMessageId: m.waMessageId,
          from: m.from,
        });
        continue;
      }
    }

    // 3. Insere mensagem inbound. Idempotência por wa_message_id (unique).
    const insertRow = {
      conversation_id: conversationId,
      wa_message_id: m.waMessageId,
      direction: 'inbound' as const,
      msg_type: mapInboundType(m.type),
      body: m.body ?? null,
      media_url: null,
      media_caption: m.caption ?? null,
      media_mime_type: m.mediaMimeType ?? null,
      status: 'received' as const,
      received_at: new Date(m.timestamp * 1000).toISOString(),
      raw: m.raw as Record<string, unknown> | null,
    };

    const { error: insertErr } = await supa
      .from('crm_messages')
      .insert(insertRow);
    if (insertErr) {
      // Erro 23505 = unique violation → mensagem duplicada, ignorar
      if (insertErr.code === '23505') {
        log('info', {
          event: 'duplicate_message_ignored',
          waMessageId: m.waMessageId,
        });
        continue;
      }
      log('error', {
        event: 'inbound_message_insert_failed',
        waMessageId: m.waMessageId,
        error: insertErr.message,
      });
    }
  }
}

function mapInboundType(t: IncomingMessage['type']): string {
  // unsupported / button / interactive → guardamos como 'system' pra
  // não quebrar o check constraint no Postgres.
  switch (t) {
    case 'text':
    case 'image':
    case 'audio':
    case 'video':
    case 'document':
    case 'sticker':
    case 'location':
    case 'reaction':
      return t;
    default:
      return 'system';
  }
}

async function createOrphanLeadAndConversation(
  waId: string,
  contactName: string | null,
): Promise<string | null> {
  const supa = getSupabaseAdmin();
  if (!supa) return null;

  // Cria um lead sintético pra preservar conversa.
  // RD status='unreachable' marca que não veio do quiz.
  const syntheticLeadId = `orphan_${waId}_${Date.now().toString(36)}`;

  const { error: leadErr } = await supa.from('crm_leads').insert({
    lead_id: syntheticLeadId,
    correlation_id: syntheticLeadId,
    captured_at: new Date().toISOString(),
    ip: null,
    tier: 'frio',
    score: 0,
    variant: 'quiz',
    name: contactName ?? 'Contato sem nome',
    whatsapp_e164: waId,
    email: null,
    payload: { _orphan: true, contact_name: contactName },
    rd_status: 'unreachable',
    rd_warning: 'orphan_inbound_before_quiz',
  });
  if (leadErr) {
    log('error', {
      event: 'orphan_lead_insert_failed',
      waId,
      error: leadErr.message,
    });
    return null;
  }

  const { data: defaultStage } = await supa
    .from('crm_pipeline_stages')
    .select('id')
    .eq('is_default_entry', true)
    .limit(1)
    .maybeSingle();

  const { data: conv, error: convErr } = await supa
    .from('crm_conversations')
    .insert({
      lead_id: syntheticLeadId,
      whatsapp_e164: waId,
      status: 'open',
      pipeline_stage_id: defaultStage?.id ?? null,
    })
    .select('id')
    .single();
  if (convErr || !conv) {
    log('error', {
      event: 'orphan_conv_insert_failed',
      waId,
      error: convErr?.message,
    });
    return null;
  }
  return conv.id;
}

// =============================================================================
// Status events (sent / delivered / read / failed)
// =============================================================================
async function handleStatusEvents(events: StatusEvent[]): Promise<void> {
  if (events.length === 0) return;
  const supa = getSupabaseAdmin();
  if (!supa) return;

  for (const ev of events) {
    const update: Record<string, unknown> = { status: ev.status };
    const tsIso = new Date(ev.timestamp * 1000).toISOString();
    if (ev.status === 'sent') update.sent_at = tsIso;
    if (ev.status === 'delivered') update.delivered_at = tsIso;
    if (ev.status === 'read') update.read_at = tsIso;
    if (ev.status === 'failed') {
      update.error_code = ev.errorCode ?? null;
      update.error_title = ev.errorTitle ?? null;
      update.error_details = ev.errorMessage ?? null;
    }

    const { error } = await supa
      .from('crm_messages')
      .update(update)
      .eq('wa_message_id', ev.waMessageId);
    if (error) {
      log('warn', {
        event: 'status_update_failed',
        waMessageId: ev.waMessageId,
        status: ev.status,
        error: error.message,
      });
    }
  }
}

// =============================================================================
// Template status updates
// =============================================================================
async function handleTemplateStatusUpdates(
  events: TemplateStatusEvent[],
): Promise<void> {
  if (events.length === 0) return;
  const supa = getSupabaseAdmin();
  if (!supa) return;

  for (const ev of events) {
    const { error } = await supa
      .from('crm_templates')
      .update({
        status: ev.newStatus,
        rejection_reason: ev.reason ?? null,
        last_synced_at: new Date().toISOString(),
      })
      .eq('meta_template_id', ev.metaTemplateId);
    if (error) {
      log('warn', {
        event: 'template_status_update_failed',
        metaTemplateId: ev.metaTemplateId,
        error: error.message,
      });
    }
  }
}
