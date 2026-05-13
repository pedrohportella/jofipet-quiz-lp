'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { StoredLead } from '@/lib/leads/store';
import type { Tier } from '@/lib/quiz/types';

interface ListResponse {
  items: StoredLead[];
  total: number;
}

const TIER_LABEL: Record<Tier, string> = {
  quente: '🔥 Quente',
  morno: '🌻 Morno',
  frio: '💙 Frio',
};

const STATUS_BADGE: Record<StoredLead['rdStatus'], string> = {
  sent: 'bg-success-300 text-success-700',
  queued: 'bg-accent-100 text-accent-700',
  rejected: 'bg-neutral-300 text-neutral-700',
  unreachable: 'bg-accent-100 text-accent-700',
  token_missing: 'bg-neutral-300 text-neutral-700',
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LeadsClient() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [tier, setTier] = useState<Tier | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (tier) params.set('tier', tier);
      params.set('limit', '50');
      try {
        const res = await fetch(`/api/admin/leads?${params.toString()}`);
        const json = (await res.json()) as ListResponse;
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
  }, [tier]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Leads</h1>
          <p className="text-sm text-neutral-500">
            {data ? `${data.total} leads totais (${data.items.length} listados)` : '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier | '')}
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium"
          >
            <option value="">Todos os tiers</option>
            <option value="quente">🔥 Quente</option>
            <option value="morno">🌻 Morno</option>
            <option value="frio">💙 Frio</option>
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl bg-white shadow-jofi-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3">UTM Source</th>
              <th className="px-4 py-3">RD</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Sem leads. Capturas vão aparecer aqui (in-memory: zera a cada cold start).
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((lead) => (
                <tr
                  key={lead.leadId}
                  className="border-t border-neutral-300 transition-colors hover:bg-neutral-100"
                >
                  <td className="px-4 py-3 text-xs text-neutral-500 tabular-nums">
                    {formatDate(lead.capturedAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    <Link
                      href={`/admin/leads/${lead.leadId}`}
                      className="hover:text-primary hover:underline"
                    >
                      {lead.payload.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-700">
                    {lead.payload.whatsapp}
                  </td>
                  <td className="px-4 py-3">{TIER_LABEL[lead.tier]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{lead.score}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {lead.payload.utms?.utm_source ?? '(direto)'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[lead.rdStatus]}`}
                    >
                      {lead.rdStatus}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
