/**
 * POST /api/admin/crm/conversations/[id]/read
 * Zera unread_count da conversa.
 */
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: 'crm_disabled' }, { status: 503 });

  const { error } = await supa
    .from('crm_conversations')
    .update({ unread_count: 0 })
    .eq('id', params.id);
  if (error) {
    return NextResponse.json(
      { error: 'db_error', message: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
