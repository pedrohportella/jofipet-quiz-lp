/**
 * GET /api/admin/analytics/leads-table
 *
 * Retorna todos os leads do Supabase com respostas do quiz já flattened
 * num formato pronto pra tabela `lead × pergunta`.
 *
 * Diferente de /api/admin/leads (que lê KV, TTL 30d), aqui lê crm_leads
 * — histórico permanente.
 *
 * Filtros via query:
 *   ?since=<ISO> | ?tier=quente|morno|frio | ?q=<text>
 * Paginação:
 *   ?limit=200&offset=0
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { listAllQuestions } from '@/lib/quiz/format-answer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;

interface LeadRow {
  lead_id: string;
  captured_at: string;
  name: string;
  whatsapp_e164: string;
  email: string | null;
  tier: 'quente' | 'morno' | 'frio';
  score: number;
  variant: 'quiz' | 'oferta_lp';
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  /** Conjunto (ad set) — convenção: {{adset.name}} ou {{adset.id}} */
  utm_term: string | null;
  /** Anúncio (ad) — convenção: {{ad.name}} ou {{ad.id}} */
  utm_content: string | null;
  /** Respostas raw — chave = id da pergunta (ex 'pet-ativo'), valor = id da opção ou número */
  answers: Record<string, unknown>;
  /** Decomposição do score por categoria */
  breakdown: Record<string, number> | null;
  /** Etapa onde ele parou (= num de answers preenchidas). Útil pra cor da célula */
  steps_answered: number;
}

export async function GET(request: NextRequest) {
  const supa = getSupabaseAdmin();
  if (!supa) {
    return NextResponse.json(
      { error: 'crm_disabled', message: 'Supabase não configurado' },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const since = url.searchParams.get('since');
  const tier = url.searchParams.get('tier');
  const q = url.searchParams.get('q');
  const limit = Math.min(
    Math.max(Number(url.searchParams.get('limit')) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);

  let query = supa
    .from('crm_leads')
    .select(
      'lead_id, captured_at, name, whatsapp_e164, email, tier, score, variant, utm_source, utm_campaign, utm_medium, utm_term, utm_content, payload',
      { count: 'exact' },
    )
    .order('captured_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (since) query = query.gte('captured_at', since);
  if (tier) query = query.eq('tier', tier);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json(
      { error: 'db_error', message: error.message },
      { status: 500 },
    );
  }

  // Aplica filtro de busca em memória (rápido pra <10k leads)
  let rows: LeadRow[] = (data ?? []).map((r) => {
    const payload = (r as { payload?: Record<string, unknown> }).payload ?? {};
    const answers = (payload.answers ?? {}) as Record<string, unknown>;
    const breakdown = (payload.breakdown ?? null) as Record<string, number> | null;
    return {
      lead_id: r.lead_id,
      captured_at: r.captured_at,
      name: r.name,
      whatsapp_e164: r.whatsapp_e164,
      email: r.email,
      tier: r.tier,
      score: Number(r.score),
      variant: r.variant,
      utm_source: r.utm_source,
      utm_medium: r.utm_medium,
      utm_campaign: r.utm_campaign,
      utm_term: r.utm_term,
      utm_content: r.utm_content,
      answers,
      breakdown,
      steps_answered: Object.keys(answers).length,
    };
  });

  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter((row) => {
      const utmHay = [
        row.utm_source,
        row.utm_medium,
        row.utm_campaign,
        row.utm_term,
        row.utm_content,
      ]
        .filter(Boolean)
        .join(' ');
      const hay = `${row.name} ${row.whatsapp_e164} ${row.email ?? ''} ${utmHay}`.toLowerCase();
      return hay.includes(needle);
    });
  }

  // Agregados pra os KPIs do topo
  const totals = computeKpis(rows);

  return NextResponse.json({
    rows,
    total: count ?? rows.length,
    questions: listAllQuestions(),
    kpis: totals,
    limit,
    offset,
  });
}

interface Kpis {
  totalLeads: number;
  byTier: { quente: number; morno: number; frio: number };
  averageScore: number;
  withEmailPct: number;
  /** Distribuição agregada de respostas por pergunta — { questionId: { optionId: count } } */
  answerDistribution: Record<string, Record<string, number>>;
}

function computeKpis(rows: LeadRow[]): Kpis {
  const byTier = { quente: 0, morno: 0, frio: 0 };
  let scoreSum = 0;
  let withEmail = 0;
  const answerDistribution: Record<string, Record<string, number>> = {};

  for (const row of rows) {
    byTier[row.tier] += 1;
    scoreSum += row.score;
    if (row.email) withEmail += 1;

    for (const [qId, value] of Object.entries(row.answers)) {
      if (!answerDistribution[qId]) answerDistribution[qId] = {};
      const dist = answerDistribution[qId]!;
      if (Array.isArray(value)) {
        for (const v of value) {
          const key = String(v);
          dist[key] = (dist[key] ?? 0) + 1;
        }
      } else {
        const key = String(value);
        dist[key] = (dist[key] ?? 0) + 1;
      }
    }
  }

  return {
    totalLeads: rows.length,
    byTier,
    averageScore: rows.length > 0 ? Math.round((scoreSum / rows.length) * 10) / 10 : 0,
    withEmailPct: rows.length > 0 ? Math.round((withEmail / rows.length) * 100) : 0,
    answerDistribution,
  };
}
