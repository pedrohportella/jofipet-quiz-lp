'use client';

import { useEffect, useMemo, useState } from 'react';

interface VariantStats {
  totals: Record<string, number>;
  byTier: { quente: number; morno: number; frio: number };
  byUtmSource: Record<string, number>;
  conversionRate: {
    quizStartToComplete: number;
    completeToCapture: number;
    captureToLead: number;
  };
}

interface Stats extends VariantStats {
  byVariant: {
    quiz: VariantStats;
    oferta_lp: VariantStats;
  };
}

type Range = 'today' | '7d' | '30d' | 'all';
type VariantFilter = 'all' | 'quiz' | 'oferta_lp';

const RANGE_LABEL: Record<Range, string> = {
  today: 'Hoje',
  '7d': '7 dias',
  '30d': '30 dias',
  all: 'Tudo',
};

const VARIANT_LABEL: Record<VariantFilter, string> = {
  all: 'Ambos',
  quiz: '🧩 Quiz',
  oferta_lp: '🛒 Oferta LP',
};

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-white p-5 shadow-jofi-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p className="text-3xl font-extrabold text-neutral-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}

function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      <div className="inline-flex rounded-lg bg-white p-1 shadow-jofi-1" role="tablist">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(opt.value)}
              className={
                active
                  ? 'rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors'
                  : 'rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900'
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>('7d');
  const [variant, setVariant] = useState<VariantFilter>('all');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/stats?range=${range}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Stats;
        if (!cancelled) {
          setStats(data);
          setError(null);
          setLoading(false);
          setLastUpdated(Date.now());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'unknown');
          setLoading(false);
        }
      }
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [range]);

  // Pick which slice of stats to show based on variant filter.
  const view: VariantStats | null = useMemo(() => {
    if (!stats) return null;
    if (variant === 'all') return stats;
    return stats.byVariant[variant];
  }, [stats, variant]);

  if (loading && !stats) return <p className="text-neutral-500">Carregando…</p>;
  if (error || !stats || !view)
    return <p className="text-error">Erro ao carregar: {error}</p>;

  const totalLeads = view.byTier.quente + view.byTier.morno + view.byTier.frio;
  const utmEntries = Object.entries(view.byUtmSource).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500">
            Período: <strong>{RANGE_LABEL[range]}</strong> · Variante:{' '}
            <strong>{VARIANT_LABEL[variant]}</strong>
            {lastUpdated && (
              <>
                {' '}·{' '}
                <span className="text-neutral-400">
                  atualizado {new Date(lastUpdated).toLocaleTimeString('pt-BR')}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <ToggleGroup
            label="Variante"
            value={variant}
            onChange={setVariant}
            options={[
              { value: 'all', label: VARIANT_LABEL.all },
              { value: 'quiz', label: VARIANT_LABEL.quiz },
              { value: 'oferta_lp', label: VARIANT_LABEL.oferta_lp },
            ]}
          />
          <ToggleGroup
            label="Período"
            value={range}
            onChange={setRange}
            options={[
              { value: 'today', label: RANGE_LABEL.today },
              { value: '7d', label: RANGE_LABEL['7d'] },
              { value: '30d', label: RANGE_LABEL['30d'] },
              { value: 'all', label: RANGE_LABEL.all },
            ]}
          />
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Funil
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Quiz iniciados" value={view.totals.quiz_started ?? 0} />
          <KpiCard
            label="Quiz concluídos"
            value={view.totals.quiz_complete ?? 0}
            sub={`${pct(view.conversionRate.quizStartToComplete)} taxa`}
          />
          <KpiCard
            label="Leads capturados"
            value={view.totals.lead_captured ?? 0}
            sub={`${pct(view.conversionRate.completeToCapture)} pós-quiz`}
          />
          <KpiCard label="CTA clicks" value={view.totals.cta_click ?? 0} />
        </div>
      </section>

      {variant === 'all' && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            A/B — Quiz vs Oferta LP
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <VariantCard
              title="🧩 Quiz"
              variant={stats.byVariant.quiz}
              accentClass="border-l-4 border-primary"
            />
            <VariantCard
              title="🛒 Oferta LP"
              variant={stats.byVariant.oferta_lp}
              accentClass="border-l-4 border-accent"
            />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Distribuição por tier
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <KpiCard
            label="🔥 Quente"
            value={view.byTier.quente}
            sub={totalLeads > 0 ? pct(view.byTier.quente / totalLeads) : '—'}
          />
          <KpiCard
            label="🌻 Morno"
            value={view.byTier.morno}
            sub={totalLeads > 0 ? pct(view.byTier.morno / totalLeads) : '—'}
          />
          <KpiCard
            label="💙 Frio"
            value={view.byTier.frio}
            sub={totalLeads > 0 ? pct(view.byTier.frio / totalLeads) : '—'}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Origem (UTM source)
        </h2>
        {utmEntries.length === 0 ? (
          <p className="text-sm text-neutral-500">Sem leads nesse período.</p>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-jofi-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-100 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-2">Origem</th>
                  <th className="px-4 py-2 text-right">Leads</th>
                  <th className="px-4 py-2 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {utmEntries.map(([source, count]) => (
                  <tr key={source} className="border-t border-neutral-300">
                    <td className="px-4 py-2 font-medium text-neutral-900">{source}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{count}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-neutral-500">
                      {totalLeads > 0 ? pct(count / totalLeads) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/**
 * Card resumido por variant (mostrado quando filter='all' pra comparação A/B).
 * 4 KPIs principais: iniciados, concluídos, capturados, conversion.
 */
function VariantCard({
  title,
  variant,
  accentClass,
}: {
  title: string;
  variant: VariantStats;
  accentClass: string;
}) {
  const totalLeads =
    variant.byTier.quente + variant.byTier.morno + variant.byTier.frio;
  return (
    <div className={`rounded-xl bg-white p-5 shadow-jofi-1 ${accentClass}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-neutral-900">{title}</h3>
        <span className="text-xs text-neutral-500">{totalLeads} leads</span>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-neutral-500">
            Iniciados
          </dt>
          <dd className="text-xl font-extrabold tabular-nums">
            {variant.totals.quiz_started ?? 0}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-neutral-500">
            Concluídos
          </dt>
          <dd className="text-xl font-extrabold tabular-nums">
            {variant.totals.quiz_complete ?? 0}
          </dd>
          <dd className="text-xs text-neutral-500">
            {pct(variant.conversionRate.quizStartToComplete)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-neutral-500">
            Leads
          </dt>
          <dd className="text-xl font-extrabold tabular-nums">
            {variant.totals.lead_captured ?? 0}
          </dd>
          <dd className="text-xs text-neutral-500">
            {pct(variant.conversionRate.completeToCapture)} pós-quiz
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-neutral-500">
            CTA clicks
          </dt>
          <dd className="text-xl font-extrabold tabular-nums">
            {variant.totals.cta_click ?? 0}
          </dd>
        </div>
      </dl>
    </div>
  );
}
