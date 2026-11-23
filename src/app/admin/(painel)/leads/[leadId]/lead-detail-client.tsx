'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { StoredLead } from '@/lib/leads/store';
import {
  ArrowLeft,
  Clock,
  Globe,
  Image as ImageIcon,
  Mail,
  Phone,
  Radio,
  Target,
  Users,
} from 'lucide-react';
import { Notice, TierChip, semEmoji } from '@/components/admin/crm-ui';
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
      <div className="rounded-xl bg-white p-8 border border-neutral-300">
        <p className="text-neutral-700">Lead não encontrado.</p>
        <Link
          href="/admin/leads"
          className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Voltar
        </Link>
      </div>
    );
  }
  if (error) return <Notice tone="warn">Erro: {error}</Notice>;
  if (!lead) return <p className="text-neutral-700">Carregando…</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/leads"
        className="inline-flex min-h-[32px] items-center gap-1 text-sm font-bold text-primary-600 hover:underline"
      >
        <ArrowLeft size={16} strokeWidth={2.25} aria-hidden="true" />
        Todos os leads
      </Link>

      <header className="rounded-xl bg-white p-6 border border-neutral-300">
        <h1 className="text-2xl font-extrabold text-neutral-900">{lead.payload.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-700">
          <span className="inline-flex items-center gap-1.5">
            <Phone size={14} strokeWidth={2} aria-hidden="true" />
            {lead.payload.whatsapp}
          </span>
          {lead.payload.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} strokeWidth={2} aria-hidden="true" />
              {lead.payload.email}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} strokeWidth={2} aria-hidden="true" />
            {new Date(lead.capturedAt).toLocaleString('pt-BR')}
          </span>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 border border-neutral-300">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Classificação
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl font-extrabold capitalize text-neutral-900">{lead.tier}</span>
            <TierChip tier={lead.tier} compact />
          </div>
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

        <div className="rounded-xl bg-white p-5 border border-neutral-300">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            RD Station
          </h2>
          <p className="mt-2 text-xl font-bold text-neutral-900">{lead.rdStatus}</p>
          {lead.rdWarning && (
            <p className="mt-1 text-sm font-semibold text-neutral-900">warning: {lead.rdWarning}</p>
          )}
          <p className="mt-2 text-xs text-neutral-500">correlationId: {lead.correlationId}</p>
          <p className="text-xs text-neutral-500">leadId: {lead.leadId}</p>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 border border-neutral-300">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Respostas do quiz — passo a passo
        </h2>
        <ol className="flex flex-col gap-3">
          {formatAnswers(lead.payload.answers as Record<string, string | number | string[]>).map(
            (a) => (
              <li
                key={a.questionId}
                className="flex flex-col gap-1 rounded-lg border border-neutral-300 bg-primary-50 p-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    Passo {a.step}
                  </span>
                  <span className="text-xs font-semibold text-neutral-700">
                    {semEmoji(a.questionText)}
                  </span>
                </div>
                <p className="text-base font-semibold text-neutral-900">{semEmoji(a.valueLabel)}</p>
              </li>
            ),
          )}
        </ol>

        <details className="mt-4 text-xs">
          <summary className="cursor-pointer font-semibold text-neutral-700 hover:text-neutral-900">
            Ver respostas raw (debug)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-neutral-100 p-3 text-[11px] text-neutral-700">
            {JSON.stringify(lead.payload.answers, null, 2)}
          </pre>
        </details>
      </section>

      {lead.payload.utms && Object.keys(lead.payload.utms).length > 0 && (
        <section className="rounded-xl bg-white p-5 border border-neutral-300">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Origem do tráfego (UTMs)
          </h2>
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            {([
              ['utm_source', 'Origem (source)', Globe],
              ['utm_medium', 'Canal (medium)', Radio],
              ['utm_campaign', 'Campanha', Target],
              ['utm_term', 'Conjunto (ad set)', Users],
              ['utm_content', 'Anúncio (ad)', ImageIcon],
            ] as const).map(([key, label, UtmIcon]) => {
              const value = lead.payload.utms?.[key];
              if (!value) return null;
              return (
                <div
                  key={key}
                  className="flex flex-col gap-0.5 rounded-lg border border-neutral-300 bg-primary-50 p-3"
                >
                  <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                    <UtmIcon size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{label}</span>
                  </dt>
                  <dd className="font-semibold text-neutral-900">
                    {String(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      )}
    </div>
  );
}
