'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { StoredLead } from '@/lib/leads/store';
import { formatAnswers } from '@/lib/quiz/format-answer';

export function LeadDetailClient({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<StoredLead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/leads/${leadId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'not_found' : `HTTP ${res.status}`);
        return (await res.json()) as StoredLead;
      })
      .then((data) => {
        if (!cancelled) setLead(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'unknown');
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  if (error === 'not_found') {
    return (
      <div className="rounded-xl bg-white p-8 shadow-jofi-1">
        <p className="text-neutral-700">Lead não encontrado.</p>
        <Link
          href="/admin/leads"
          className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
        >
          ← Voltar
        </Link>
      </div>
    );
  }
  if (error) return <p className="text-error">Erro: {error}</p>;
  if (!lead) return <p className="text-neutral-500">Carregando…</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/leads"
        className="text-sm font-semibold text-neutral-500 hover:text-primary"
      >
        ← Todos os leads
      </Link>

      <header className="rounded-xl bg-white p-6 shadow-jofi-1">
        <h1 className="text-2xl font-extrabold text-neutral-900">{lead.payload.name}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-700">
          <span>📞 {lead.payload.whatsapp}</span>
          {lead.payload.email && <span>✉️ {lead.payload.email}</span>}
          <span>
            🕒 {new Date(lead.capturedAt).toLocaleString('pt-BR')}
          </span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-jofi-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Classificação
          </h2>
          <p className="mt-2 text-3xl font-extrabold capitalize text-neutral-900">{lead.tier}</p>
          <p className="text-sm text-neutral-500">Score total: {lead.score}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-neutral-500">Pet ativo</dt>
            <dd className="text-right font-medium tabular-nums">{lead.payload.breakdown.pet_ativo}</dd>
            <dt className="text-neutral-500">Gasto</dt>
            <dd className="text-right font-medium tabular-nums">{lead.payload.breakdown.gasto}</dd>
            <dt className="text-neutral-500">Dor</dt>
            <dd className="text-right font-medium tabular-nums">{lead.payload.breakdown.dor}</dd>
            <dt className="text-neutral-500">Cobertura</dt>
            <dd className="text-right font-medium tabular-nums">{lead.payload.breakdown.cobertura}</dd>
          </dl>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-jofi-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            RD Station
          </h2>
          <p className="mt-2 text-xl font-bold text-neutral-900">{lead.rdStatus}</p>
          {lead.rdWarning && (
            <p className="text-sm text-accent-700">warning: {lead.rdWarning}</p>
          )}
          <p className="mt-2 text-xs text-neutral-500">correlationId: {lead.correlationId}</p>
          <p className="text-xs text-neutral-500">leadId: {lead.leadId}</p>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow-jofi-1">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Respostas do quiz — passo a passo
        </h2>
        <ol className="flex flex-col gap-3">
          {formatAnswers(lead.payload.answers as Record<string, string | number | string[]>).map(
            (a) => (
              <li
                key={a.questionId}
                className="flex flex-col gap-1 rounded-lg border border-neutral-100 bg-neutral-50/50 p-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Passo {a.step}
                  </span>
                  <span className="text-xs font-semibold text-neutral-500">
                    {a.questionEmoji} {a.questionText}
                  </span>
                </div>
                <p className="text-base font-semibold text-neutral-900">{a.valueLabel}</p>
              </li>
            ),
          )}
        </ol>

        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-neutral-400 hover:text-neutral-600">
            Ver respostas raw (debug)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-neutral-100 p-3 text-[11px] text-neutral-700">
            {JSON.stringify(lead.payload.answers, null, 2)}
          </pre>
        </details>
      </section>

      {lead.payload.utms && Object.keys(lead.payload.utms).length > 0 && (
        <section className="rounded-xl bg-white p-5 shadow-jofi-1">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            UTMs
          </h2>
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            {Object.entries(lead.payload.utms).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3 border-b border-neutral-100 py-1">
                <dt className="text-neutral-500">{key}</dt>
                <dd className="font-medium text-neutral-900">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
