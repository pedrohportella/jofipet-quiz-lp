/**
 * GET /api/admin/crm/conversations/[id]
 *
 * Detalhe da conversa: lead completo + últimas N mensagens.
 * Default: últimas 100 mensagens. Pode passar ?limit=200&before=<ISO>.
 *
 * PATCH /api/admin/crm/conversations/[id]
 *
 * Atualiza pipeline_stage_id, status, assigned_to. Loga em
 * crm_assignments_log pra audit trail.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PATCH_BODY = z
  .object({
    pipeline_stage_id: z.string().uuid().nullable().optional(),
    status: z.enum(['open', 'snoozed', 'closed']).optional(),
    assigned_to: z.string().uuid().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: 'no_fields_to_update',
  });

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json({ error: 'crm_disabled' }, { status: 503 });
  }
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 100, 500);

  const { data: conv, error: convErr } = await supa
    .from('crm_conversations')
    .select(
      `id, status, pipeline_stage_id, assigned_to, last_message_at, unread_count, customer_last_inbound_at, created_at,
       lead:crm_leads(*)`,
    )
    .eq('id', params.id)
    .maybeSingle();
  if (convErr) {
    return NextResponse.json(
      { error: 'db_error', message: convErr.message },
      { status: 500 },
    );
  }
  if (!conv) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const { data: messages, error: msgErr } = await supa
    .from('crm_messages')
    .select('*')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (msgErr) {
    return NextResponse.json(
      { error: 'db_error', message: msgErr.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    conversation: conv,
    messages: (messages ?? []).slice().reverse(), // exibir cronológico ascendente
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json({ error: 'crm_disabled' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = PATCH_BODY.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Lê estado atual pra log
  const { data: before } = await supa
    .from('crm_conversations')
    .select('pipeline_stage_id, status, assigned_to')
    .eq('id', params.id)
    .maybeSingle();

  const { data, error } = await supa
    .from('crm_conversations')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single();
  if (error || !data) {
    return NextResponse.json(
      { error: 'db_error', message: error?.message },
      { status: 500 },
    );
  }

  // Log audit
  const logs: Array<{
    conversation_id: string;
    change_type: 'stage' | 'assignee' | 'status';
    from_value: string | null;
    to_value: string | null;
  }> = [];
  if (
    parsed.data.pipeline_stage_id !== undefined &&
    parsed.data.pipeline_stage_id !== before?.pipeline_stage_id
  ) {
    logs.push({
      conversation_id: params.id,
      change_type: 'stage',
      from_value: before?.pipeline_stage_id ?? null,
      to_value: parsed.data.pipeline_stage_id,
    });
  }
  if (parsed.data.status && parsed.data.status !== before?.status) {
    logs.push({
      conversation_id: params.id,
      change_type: 'status',
      from_value: before?.status ?? null,
      to_value: parsed.data.status,
    });
  }
  if (
    parsed.data.assigned_to !== undefined &&
    parsed.data.assigned_to !== before?.assigned_to
  ) {
    logs.push({
      conversation_id: params.id,
      change_type: 'assignee',
      from_value: before?.assigned_to ?? null,
      to_value: parsed.data.assigned_to,
    });
  }
  if (logs.length > 0) {
    await supa.from('crm_assignments_log').insert(logs);
  }

  return NextResponse.json({ conversation: data });
}
