/**
 * GET /api/admin/crm/conversations
 *
 * Lista conversas com lead info + última mensagem.
 * Filtros via query: ?status=open|snoozed|closed&stage=<uuid>&tier=quente|morno|frio&q=<text>
 * Paginação: ?limit=50&offset=0
 *
 * Auth: o middleware Basic Auth (/api/admin/*) já protege essa rota.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(request: NextRequest) {
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json(
      { error: 'crm_disabled', message: 'Supabase não configurado' },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const stage = url.searchParams.get('stage');
  const tier = url.searchParams.get('tier');
  const q = url.searchParams.get('q');
  const limit = Math.min(
    Math.max(Number(url.searchParams.get('limit')) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);

  let query = supa
    .from('crm_conversations')
    .select(
      `id, status, pipeline_stage_id, assigned_to, last_message_at, unread_count, customer_last_inbound_at,
       lead:crm_leads(lead_id, name, whatsapp_e164, email, tier, score, captured_at, utm_source)`,
      { count: 'exact' },
    )
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (stage) query = query.eq('pipeline_stage_id', stage);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json(
      { error: 'db_error', message: error.message },
      { status: 500 },
    );
  }

  // Filtros aplicados em memória (tier/q) — barato pra <500 leads/mês
  let items = (data ?? []) as unknown as Array<{
    id: string;
    status: string;
    pipeline_stage_id: string | null;
    assigned_to: string | null;
    last_message_at: string | null;
    unread_count: number;
    customer_last_inbound_at: string | null;
    lead: {
      lead_id: string;
      name: string;
      whatsapp_e164: string;
      email: string | null;
      tier: 'quente' | 'morno' | 'frio';
      score: number;
      captured_at: string;
      utm_source: string | null;
    } | null;
  }>;

  if (tier) items = items.filter((i) => i.lead?.tier === tier);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((i) => {
      const hay = `${i.lead?.name ?? ''} ${i.lead?.whatsapp_e164 ?? ''} ${
        i.lead?.email ?? ''
      }`.toLowerCase();
      return hay.includes(needle);
    });
  }

  return NextResponse.json({
    items,
    total: count ?? items.length,
    limit,
    offset,
  });
}
