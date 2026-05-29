/**
 * POST /api/admin/crm/conversations/[id]/messages
 *
 * Envia mensagem via Cloud API e persiste em crm_messages.
 * Body: { type: 'text', body: '...' } OU { type: 'template', name: '...', language: '...', params: [...] }
 *
 * Política de janela 24h: a Cloud API rejeita texto livre se o cliente
 * não respondeu em 24h. A UI deve validar antes (mostrar só botão de
 * template quando customer_last_inbound_at > 24h atrás), mas aqui ainda
 * tratamos o erro 131047 retornado pela Meta como mensagem clara.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { readWhatsAppConfig } from '@/lib/whatsapp/config';
import { sendText, sendTemplate } from '@/lib/whatsapp/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BODY = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    body: z.string().min(1).max(4096),
  }),
  z.object({
    type: z.literal('template'),
    name: z.string().min(1),
    language: z.string().min(2).max(10),
    params: z.array(z.string()).optional(),
  }),
]);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: 'crm_disabled' }, { status: 503 });

  const cfg = readWhatsAppConfig();
  if (!cfg)
    return NextResponse.json(
      { error: 'whatsapp_disabled', message: 'Cloud API não configurada' },
      { status: 503 },
    );

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = BODY.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Resolve número de destino
  const { data: conv, error: convErr } = await supa
    .from('crm_conversations')
    .select('id, whatsapp_e164')
    .eq('id', params.id)
    .maybeSingle();
  if (convErr || !conv) {
    return NextResponse.json(
      { error: 'conversation_not_found' },
      { status: 404 },
    );
  }

  // Envia
  let result: Awaited<ReturnType<typeof sendText | typeof sendTemplate>>;
  if (parsed.data.type === 'text') {
    result = await sendText(cfg, {
      to: conv.whatsapp_e164,
      body: parsed.data.body,
    });
  } else {
    const components = parsed.data.params?.length
      ? [
          {
            type: 'body' as const,
            parameters: parsed.data.params.map((p) => ({
              type: 'text' as const,
              text: p,
            })),
          },
        ]
      : [];
    result = await sendTemplate(cfg, {
      to: conv.whatsapp_e164,
      templateName: parsed.data.name,
      language: parsed.data.language,
      components,
    });
  }

  const baseRow = {
    conversation_id: params.id,
    direction: 'outbound' as const,
    msg_type: (parsed.data.type === 'text' ? 'text' : 'template') as
      | 'text'
      | 'template',
    body: parsed.data.type === 'text' ? parsed.data.body : null,
    template_name: parsed.data.type === 'template' ? parsed.data.name : null,
    template_language:
      parsed.data.type === 'template' ? parsed.data.language : null,
    template_params:
      parsed.data.type === 'template' && parsed.data.params
        ? Object.fromEntries(
            parsed.data.params.map((p, i) => [String(i + 1), p]),
          )
        : null,
    is_automated: false,
  };

  if (result.ok) {
    const { data: inserted, error: insErr } = await supa
      .from('crm_messages')
      .insert({
        ...baseRow,
        wa_message_id: result.waMessageId,
        status: 'sent',
        sent_at: new Date().toISOString(),
        raw: result.raw as Record<string, unknown> | null,
      })
      .select()
      .single();
    if (insErr) {
      return NextResponse.json(
        { error: 'db_error', message: insErr.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: inserted });
  }

  // Persiste falha pra ficar visível no histórico
  await supa.from('crm_messages').insert({
    ...baseRow,
    status: 'failed',
    error_code: result.errorCode ?? null,
    error_title: result.errorTitle ?? null,
    error_details: result.errorMessage ?? null,
    raw: (result.raw as Record<string, unknown> | null) ?? null,
  });

  return NextResponse.json(
    {
      error: 'send_failed',
      status: result.status,
      code: result.errorCode,
      message: result.errorMessage,
      retryable: result.retryable,
    },
    { status: 502 },
  );
}
