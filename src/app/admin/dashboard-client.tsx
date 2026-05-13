'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totals: Record<string, number>;
  byTier: { quente: number; morno: number; frio: number };
  byUtmSource: Record<string, number>;
  conversionRate: {
    quizStartToComplete: number;
    completeToCapture: number;
  };
}

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-white p-5 shadow-jofi-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="text-3xl font-extrabold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}

export function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/stats', { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Stats;
        if (!cancelled) {
          setStats(data);
          setLoading(false);
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
  }, []);

  if (loading) return <p className="text-neutral-500">Carregando…</p>;
  if (error || !stats) return <p className="text-error">Erro ao carregar: {error}</p>;

  const totalLeads = stats.byTier.quente + stats.byTier.morno + stats.byTier.frio;
  const utmEntries = Object.entries(stats.byUtmSource).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-extrabold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">Atualiza a cada 30 segundos · in-memory store</p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Funil
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Quiz iniciados" value={stats.totals.quiz_started ?? 0} />
          <KpiCard
            label="Quiz concluídos"
            value={stats.totals.quiz_complete ?? 0}
            sub={`${pct(stats.conversionRate.quizStartToComplete)} taxa`}
          />
          <KpiCard
            label="Leads capturados"
            value={stats.totals.lead_captured ?? 0}
            sub={`${pct(stats.conversionRate.completeToCapture)} pós-quiz`}
          />
          <KpiCard label="CTA clicks" value={stats.totals.cta_click ?? 0} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Distribuição por tier
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <KpiCard
            label="🔥 Quente"
            value={stats.byTier.quente}
            sub={totalLeads > 0 ? pct(stats.byTier.quente / totalLeads) : '—'}
          />
          <KpiCard
            label="🌻 Morno"
            value={stats.byTier.morno}
            sub={totalLeads > 0 ? pct(stats.byTier.morno / totalLeads) : '—'}
          />
          <KpiCard
            label="💙 Frio"
            value={stats.byTier.frio}
            sub={totalLeads > 0 ? pct(stats.byTier.frio / totalLeads) : '—'}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Origem (UTM source)
        </h2>
        {utmEntries.length === 0 ? (
          <p className="text-sm text-neutral-500">Sem leads ainda.</p>
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
                      {pct(count / totalLeads)}
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
