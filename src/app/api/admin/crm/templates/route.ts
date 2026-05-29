/**
 * GET /api/admin/crm/templates
 * Lista templates aprovados (ou todos, se ?status=all).
 */
import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supa = getSupabaseAdmin();
  if (!supa) return NextResponse.json({ error: 'crm_disabled' }, { status: 503 });
  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'APPROVED';

  let query = supa.from('crm_templates').select('*').order('name', { ascending: true });
  if (status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { error: 'db_error', message: error.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ templates: data ?? [] });
}
