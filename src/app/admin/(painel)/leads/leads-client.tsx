'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Clock, Download, Puzzle, ShoppingCart } from 'lucide-react';
import { TierChip } from '@/components/admin/crm-ui';
import type { StoredLead } from '@/lib/leads/store';
import type { Tier } from '@/lib/quiz/types';

interface ListResponse {
  items: StoredLead[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

type Range = 'today' | '7d' | '30d' | 'all';
type VariantFilter = '' | 'quiz' | 'oferta_lp';
type RdStatusFilter = '' | StoredLead['rdStatus'];

const VARIANT_LABEL: Record<'quiz' | 'oferta_lp', { label: string; Icon: typeof Puzzle }> = {
  quiz: { label: 'Quiz', Icon: Puzzle },
  oferta_lp: { label: 'Oferta', Icon: ShoppingCart },
};

/** Status do envio ao RD: ícone + nome técnico; sem verde nem vermelho (só tokens do DS). */
const STATUS_BADGE: Record<
  StoredLead['rdStatus'],
  { cls: string; Icon: typeof Check }
> = {
  sent: { cls: 'bg-primary-100', Icon: Check },
  queued: { cls: 'bg-primary-50 ring-1 ring-primary-100', Icon: Clock },
  rejected: { cls: 'bg-accent-100', Icon: AlertTriangle },
  unreachable: { cls: 'bg-accent-100', Icon: AlertTriangle },
  token_missing: { cls: 'bg-accent-100', Icon: AlertTriangle },
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce simples — usado pra busca por texto, evita 1 request por keystroke.
 */
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function LeadsClient() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros (state local, debounced via useDebouncedValue pra search)
  const [tier, setTier] = useState<Tier | ''>('');
  const [variant, setVariant] = useState<VariantFilter>('');
  const [rdStatus, setRdStatus] = useState<RdStatusFilter>('');
  const [range, setRange] = useState<Range>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const pageSize = 50;

  // Sempre que um filtro muda, volta pra página 1
  useEffect(() => {
    setPage(1);
  }, [tier, variant, rdStatus, range, debouncedSearch]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (tier) params.set('tier', tier);
    if (variant) params.set('variant', variant);
    if (rdStatus) params.set('rdStatus', rdStatus);
    if (range !== 'all') params.set('range', range);
    if (debouncedSearch) params.set('q', debouncedSearch);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return params.toString();
  }, [tier, variant, rdStatus, range, debouncedSearch, page]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/leads?${queryParams}`, {
          cache: 'no-store',
        });
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
    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams(queryParams);
    params.delete('page');
    params.delete('pageSize');
    return `/api/admin/leads/export?${params.toString()}`;
  }, [queryParams]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
  const hasFilters = !!(tier || variant || rdStatus || range !== 'all' || search);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Leads</h1>
          <p className="text-sm text-neutral-500">
            {data
              ? `${data.total} ${data.total === 1 ? 'lead' : 'leads'}${hasFilters ? ' (filtrados)' : ''} · ${data.items.length} nessa página`
              : '—'}
          </p>
        </div>
        <a
          href={exportUrl}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-pill border-2 border-neutral-900 bg-white px-5 text-sm font-extrabold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-primary-50"
          download
        >
          <Download size={16} strokeWidth={2.25} aria-hidden="true" />
          Exportar CSV
        </a>
      </header>

      <FilterBar
        tier={tier}
        setTier={setTier}
        variant={variant}
        setVariant={setVariant}
        rdStatus={rdStatus}
        setRdStatus={setRdStatus}
        range={range}
        setRange={setRange}
        search={search}
        setSearch={setSearch}
        hasFilters={hasFilters}
        onClear={() => {
          setTier('');
          setVariant('');
          setRdStatus('');
          setRange('all');
          setSearch('');
        }}
      />

      <div className="overflow-hidden rounded-xl bg-white border border-neutral-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Variante</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3">UTM Source</th>
                <th className="px-4 py-3">RD</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    Carregando…
                  </td>
                </tr>
              )}
              {!loading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                    Nenhum lead {hasFilters ? 'pros filtros selecionados' : 'ainda'}.
                  </td>
                </tr>
              )}
              {!loading &&
                data?.items.map((lead) => (
                  <tr
                    key={lead.leadId}
                    className="border-t border-neutral-300 transition-colors hover:bg-primary-50"
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
                    <td className="px-4 py-3 text-xs text-neutral-700">
                      <span className="inline-flex items-center gap-1.5">
                        {(() => {
                          const v = VARIANT_LABEL[lead.variant ?? 'quiz'];
                          return (
                            <>
                              <v.Icon size={14} strokeWidth={2} aria-hidden="true" />
                              {v.label}
                            </>
                          );
                        })()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <TierChip tier={lead.tier} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{lead.score}</td>
                    <td className="px-4 py-3 text-xs text-neutral-500">
                      {lead.payload.utms?.utm_source ?? '(direto)'}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const b = STATUS_BADGE[lead.rdStatus];
                        return (
                          <span
                            className={`inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-bold text-neutral-900 ${b.cls}`}
                          >
                            <b.Icon size={12} strokeWidth={2.25} aria-hidden="true" />
                            {lead.rdStatus}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data && data.total > pageSize && (
          <div className="flex items-center justify-between border-t border-neutral-300 bg-neutral-100 px-4 py-3 text-sm">
            <span className="text-neutral-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="min-h-[40px] rounded-pill border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-900 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasMore || loading}
                className="min-h-[40px] rounded-pill border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-900 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBar(props: {
  tier: Tier | '';
  setTier: (t: Tier | '') => void;
  variant: VariantFilter;
  setVariant: (v: VariantFilter) => void;
  rdStatus: RdStatusFilter;
  setRdStatus: (s: RdStatusFilter) => void;
  range: Range;
  setRange: (r: Range) => void;
  search: string;
  setSearch: (s: string) => void;
  hasFilters: boolean;
  onClear: () => void;
}) {
  const selectClass =
    'min-h-[44px] rounded-pill border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 border border-neutral-300">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-1 min-w-[200px] flex-col gap-1">
          <label
            htmlFor="filter-search"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            Buscar
          </label>
          <input
            id="filter-search"
            type="search"
            value={props.search}
            onChange={(e) => props.setSearch(e.target.value)}
            placeholder="Nome, WhatsApp ou email…"
            className="min-h-[44px] rounded-pill border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-range"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            Período
          </label>
          <select
            id="filter-range"
            value={props.range}
            onChange={(e) => props.setRange(e.target.value as Range)}
            className={selectClass}
          >
            <option value="all">Tudo</option>
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-variant"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            Variante
          </label>
          <select
            id="filter-variant"
            value={props.variant}
            onChange={(e) => props.setVariant(e.target.value as VariantFilter)}
            className={selectClass}
          >
            <option value="">Todas</option>
            <option value="quiz">Quiz</option>
            <option value="oferta_lp">Oferta LP</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-tier"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            Tier
          </label>
          <select
            id="filter-tier"
            value={props.tier}
            onChange={(e) => props.setTier(e.target.value as Tier | '')}
            className={selectClass}
          >
            <option value="">Todos</option>
            <option value="quente">Quente</option>
            <option value="morno">Morno</option>
            <option value="frio">Frio</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-rd-status"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
          >
            Status RD
          </label>
          <select
            id="filter-rd-status"
            value={props.rdStatus}
            onChange={(e) => props.setRdStatus(e.target.value as RdStatusFilter)}
            className={selectClass}
          >
            <option value="">Todos</option>
            <option value="sent">sent</option>
            <option value="queued">queued</option>
            <option value="rejected">rejected</option>
            <option value="unreachable">unreachable</option>
            <option value="token_missing">token_missing</option>
          </select>
        </div>

        {props.hasFilters && (
          <button
            type="button"
            onClick={props.onClear}
            className="min-h-[44px] rounded-pill border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-900 transition-colors hover:bg-primary-50"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
