'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Tier } from '@/lib/quiz/types';
import { formatQuizAnswer } from '@/lib/quiz/format-answer';

// =============================================================================
// Tipos do payload da API
// =============================================================================
interface LeadRow {
  lead_id: string;
  captured_at: string;
  name: string;
  whatsapp_e164: string;
  email: string | null;
  tier: Tier;
  score: number;
  variant: 'quiz' | 'oferta_lp';
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  answers: Record<string, unknown>;
  breakdown: Record<string, number> | null;
  steps_answered: number;
}

interface QuestionMeta {
  id: string;
  text: string;
  emoji: string;
  type: string;
  step: number;
  options?: Array<{ id: string; label: string; emoji?: string }>;
}

interface Kpis {
  totalLeads: number;
  byTier: { quente: number; morno: number; frio: number };
  averageScore: number;
  withEmailPct: number;
  answerDistribution: Record<string, Record<string, number>>;
}

interface ApiResponse {
  rows: LeadRow[];
  total: number;
  questions: QuestionMeta[];
  kpis: Kpis;
  limit: number;
  offset: number;
}

// =============================================================================
// Constantes visuais
// =============================================================================
const TIER_BADGE: Record<Tier, string> = {
  quente: 'bg-red-100 text-red-700 ring-red-200',
  morno: 'bg-amber-100 text-amber-700 ring-amber-200',
  frio: 'bg-blue-100 text-blue-700 ring-blue-200',
};

const TIER_LABEL: Record<Tier, string> = {
  quente: '🔥 Quente',
  morno: '🌻 Morno',
  frio: '💙 Frio',
};

type PeriodFilter = 'today' | '7d' | '30d' | 'all';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  today: 'Hoje',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  all: 'Tudo',
};

// =============================================================================
// Helpers
// =============================================================================
function isoSince(period: PeriodFilter): string | undefined {
  if (period === 'all') return undefined;
  const now = Date.now();
  const ms =
    period === 'today'
      ? 24 * 60 * 60 * 1000
      : period === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;
  return new Date(now - ms).toISOString();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPhone(e164: string): string {
  if (!e164.startsWith('55')) return `+${e164}`;
  const rest = e164.slice(2);
  if (rest.length === 11) {
    return `(${rest.slice(0, 2)}) ${rest.slice(2, 7)}-${rest.slice(7)}`;
  }
  return e164;
}

function downloadCsv(rows: LeadRow[], questions: QuestionMeta[]): void {
  const headers = [
    'data',
    'hora',
    'nome',
    'whatsapp',
    'email',
    'tier',
    'score',
    'utm_source',
    'utm_campaign',
    ...questions.map((q) => `q_${q.id}`),
  ];
  const lines = rows.map((row) => {
    const cells = [
      formatDate(row.captured_at),
      formatTime(row.captured_at),
      row.name,
      formatPhone(row.whatsapp_e164),
      row.email ?? '',
      row.tier,
      row.score,
      row.utm_source ?? '',
      row.utm_campaign ?? '',
      ...questions.map((q) => {
        const raw = row.answers[q.id];
        if (raw === undefined || raw === null || raw === '') return '';
        const v = formatQuizAnswer(q.id, raw as string | number | string[]);
        return v.valueLabel;
      }),
    ];
    return cells
      .map((c) => {
        const s = String(c);
        return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      })
      .join(',');
  });
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =============================================================================
// Componente principal
// =============================================================================
export function QuizAnalyticsClient() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');
  const [search, setSearch] = useState('');

  // Distribuição modal
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const since = isoSince(period);
      if (since) params.set('since', since);
      if (tierFilter !== 'all') params.set('tier', tierFilter);
      if (search) params.set('q', search);
      params.set('limit', '500');

      const res = await fetch(
        `/api/admin/analytics/leads-table?${params}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
    } finally {
      setLoading(false);
    }
  }, [period, tierFilter, search]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-neutral-900">
          Análise do Quiz
        </h1>
        <p className="text-sm text-neutral-500">
          Histórico passo-a-passo de cada lead que entrou no quiz. Use pra
          identificar onde os leads param e qual é o perfil real do público.
        </p>
      </header>

      {/* KPIs */}
      {data && <KpiCards kpis={data.kpis} totalShown={data.rows.length} />}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-jofi-1">
        <input
          type="search"
          placeholder="Buscar nome, telefone, email, UTM…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[260px] flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />

        <div className="flex gap-2">
          {(['today', '7d', '30d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['all', 'quente', 'morno', 'frio'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                tierFilter === t
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {t === 'all' ? 'Todos tiers' : TIER_LABEL[t]}
            </button>
          ))}
        </div>

        <button
          onClick={() => data && downloadCsv(data.rows, data.questions)}
          disabled={!data || data.rows.length === 0}
          className="ml-auto rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          ⬇ Exportar CSV
        </button>
      </div>

      {/* Tabela */}
      {loading && (
        <p className="rounded-xl bg-white p-8 text-center text-neutral-500 shadow-jofi-1">
          Carregando…
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-white p-8 text-error shadow-jofi-1">
          Erro: {error}. CRM configurado? Confere `SUPABASE_*` no .env.
        </p>
      )}

      {!loading && !error && data && (
        <LeadsTable
          rows={data.rows}
          questions={data.questions}
          onQuestionClick={(qId) =>
            setExpandedQuestion(qId === expandedQuestion ? null : qId)
          }
          expandedQuestion={expandedQuestion}
          distribution={data.kpis.answerDistribution}
        />
      )}
    </div>
  );
}

// =============================================================================
// KPIs
// =============================================================================
function KpiCards({ kpis, totalShown }: { kpis: Kpis; totalShown: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
      <KpiCard
        label="Leads"
        value={kpis.totalLeads}
        sub={
          totalShown !== kpis.totalLeads
            ? `${totalShown} exibidos`
            : 'na seleção atual'
        }
      />
      <KpiCard
        label="Quente"
        value={kpis.byTier.quente}
        sub={`${pct(kpis.byTier.quente, kpis.totalLeads)}%`}
        accent="bg-red-50 text-red-700"
      />
      <KpiCard
        label="Morno"
        value={kpis.byTier.morno}
        sub={`${pct(kpis.byTier.morno, kpis.totalLeads)}%`}
        accent="bg-amber-50 text-amber-700"
      />
      <KpiCard
        label="Frio"
        value={kpis.byTier.frio}
        sub={`${pct(kpis.byTier.frio, kpis.totalLeads)}%`}
        accent="bg-blue-50 text-blue-700"
      />
      <KpiCard
        label="Score médio"
        value={kpis.averageScore.toFixed(1)}
        sub={`${kpis.withEmailPct}% c/ email`}
      />
    </div>
  );
}

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-xl p-4 shadow-jofi-1 ${accent ?? 'bg-white'}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
      {sub && <p className="text-xs opacity-70">{sub}</p>}
    </div>
  );
}

// =============================================================================
// Tabela
// =============================================================================
function LeadsTable({
  rows,
  questions,
  onQuestionClick,
  expandedQuestion,
  distribution,
}: {
  rows: LeadRow[];
  questions: QuestionMeta[];
  onQuestionClick: (qId: string) => void;
  expandedQuestion: string | null;
  distribution: Record<string, Record<string, number>>;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl bg-white p-8 text-center text-neutral-500 shadow-jofi-1">
        Nenhum lead nessa seleção. Ajusta os filtros ou capture leads pelo
        quiz pra povoar.
      </p>
    );
  }

  // Largura mínima por coluna pra não espremer
  const colWidthClass = 'min-w-[140px]';

  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-jofi-1">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="sticky left-0 z-10 bg-neutral-50 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Lead
            </th>
            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Tier · Score
            </th>
            {questions.map((q) => (
              <th
                key={q.id}
                onClick={() => onQuestionClick(q.id)}
                className={`cursor-pointer px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:bg-neutral-100 ${colWidthClass}`}
                title="Click pra ver distribuição"
              >
                <div className="flex items-center gap-1">
                  <span className="text-neutral-400">P{q.step}</span>
                  <span>{q.emoji}</span>
                </div>
                <div className="mt-0.5 text-[11px] normal-case font-medium text-neutral-700 line-clamp-2">
                  {q.text}
                </div>
                {expandedQuestion === q.id && (
                  <DistributionMini
                    dist={distribution[q.id] ?? {}}
                    question={q}
                  />
                )}
              </th>
            ))}
            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              UTM
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <LeadTableRow
              key={row.lead_id}
              row={row}
              questions={questions}
              evenRow={idx % 2 === 0}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadTableRow({
  row,
  questions,
  evenRow,
}: {
  row: LeadRow;
  questions: QuestionMeta[];
  evenRow: boolean;
}) {
  return (
    <tr className={evenRow ? 'bg-white' : 'bg-neutral-50/50'}>
      {/* Lead */}
      <td
        className={`sticky left-0 z-10 whitespace-nowrap border-r border-neutral-100 px-3 py-2 ${
          evenRow ? 'bg-white' : 'bg-neutral-50/50'
        }`}
      >
        <a
          href={`/admin/leads/${row.lead_id}`}
          className="font-semibold text-neutral-900 hover:text-primary hover:underline"
        >
          {row.name}
        </a>
        <div className="text-xs text-neutral-500">
          {formatPhone(row.whatsapp_e164)}
        </div>
        <div className="text-[10px] text-neutral-400">
          {formatDate(row.captured_at)} {formatTime(row.captured_at)}
        </div>
      </td>

      {/* Tier */}
      <td className="whitespace-nowrap px-3 py-2">
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${TIER_BADGE[row.tier]}`}
        >
          {TIER_LABEL[row.tier]}
        </span>
        <div className="mt-1 text-xs font-bold tabular-nums text-neutral-700">
          {row.score}
        </div>
      </td>

      {/* Respostas por pergunta */}
      {questions.map((q) => {
        const raw = row.answers[q.id];
        const answered = raw !== undefined && raw !== null && raw !== '';
        if (!answered) {
          return (
            <td
              key={q.id}
              className="px-2 py-2 text-xs text-neutral-300"
              title="Não respondeu"
            >
              —
            </td>
          );
        }
        const formatted = formatQuizAnswer(
          q.id,
          raw as string | number | string[],
        );
        return (
          <td
            key={q.id}
            className="px-2 py-2 text-xs text-neutral-700"
            title={`${q.text}\n→ ${formatted.valueLabel}`}
          >
            <span className="line-clamp-2">{formatted.valueLabel}</span>
          </td>
        );
      })}

      {/* UTM */}
      <td className="whitespace-nowrap px-3 py-2 text-xs text-neutral-500">
        {row.utm_source ?? '(direto)'}
        {row.utm_campaign && (
          <div className="text-[10px] text-neutral-400">
            {row.utm_campaign}
          </div>
        )}
      </td>
    </tr>
  );
}

// =============================================================================
// Distribuição agregada (sparkline) ao expandir pergunta
// =============================================================================
function DistributionMini({
  dist,
  question,
}: {
  dist: Record<string, number>;
  question: QuestionMeta;
}) {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0);

  if (entries.length === 0) {
    return (
      <div className="mt-2 text-[10px] font-normal text-neutral-400">
        Sem dados ainda
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1 text-[10px] font-normal normal-case text-neutral-600">
      {entries.slice(0, 6).map(([key, count]) => {
        // Resolve label da opção
        const opt = question.options?.find((o) => o.id === key);
        const label = opt ? opt.label : key;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className="flex items-center gap-1">
            <span className="w-12 text-right font-semibold tabular-nums">
              {percent}%
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <span
                className="block h-full bg-primary"
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className="ml-1 truncate" title={label}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
