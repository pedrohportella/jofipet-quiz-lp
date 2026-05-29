/**
 * GET /api/admin/crm/pipeline-stages
 * Lista todos os stages na ordem do order_index.
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: 'crm_disabled' }, { status: 503 });
  const { data, error } = await supa
    .from('crm_pipeline_stages')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) {
    return NextResponse.json(
      { error: 'db_error', message: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ stages: data ?? [] });
}
