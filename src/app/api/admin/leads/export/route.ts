import { type NextRequest } from 'next/server';
import { listLeads, type StoredLead } from '@/lib/leads/store';
import type { Tier } from '@/lib/quiz/types';

export const runtime = 'nodejs';

const VALID_TIERS: Tier[] = ['quente', 'morno', 'frio'];
const VALID_VARIANTS = ['quiz', 'oferta_lp'] as const;
const VALID_RD_STATUS: StoredLead['rdStatus'][] = [
  'sent',
  'queued',
  'rejected',
  'unreachable',
  'token_missing',
];

function parseRange(range: string | null): number | undefined {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  switch (range) {
    case 'today': {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    case '7d':
      return now - 7 * DAY;
    case '30d':
      return now - 30 * DAY;
    default:
      return undefined;
  }
}

/**
 * Escape CSV field — duplica aspas internas e envolve em aspas se contiver
 * vírgula, quebra de linha ou aspas. Sem isso, Excel/Sheets bagunça colunas.
 */
function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export leads como CSV.
 *
 * Mesmos filtros do GET /api/admin/leads, mas limite máximo de 10000 leads
 * por export (proteção contra OOM). Sem paginação — devolve tudo num arquivo só.
 *
 * Headers do CSV (em PT-BR pra Jofi importar em planilha):
 *   Data, Lead ID, Nome, WhatsApp, Email, Tier, Score, Variant,
 *   UTM Source, UTM Medium, UTM Campaign, RD Status, IP
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tierParam = url.searchParams.get('tier');
  const variantParam = url.searchParams.get('variant');
  const rdStatusParam = url.searchParams.get('rdStatus');
  const rangeParam = url.searchParams.get('range');
  const sinceParam = url.searchParams.get('since');
  const utmSourceParam = url.searchParams.get('utmSource');
  const qParam = url.searchParams.get('q');

  const tier =
    tierParam && VALID_TIERS.includes(tierParam as Tier)
      ? (tierParam as Tier)
      : undefined;
  const variant =
    variantParam &&
    (VALID_VARIANTS as readonly string[]).includes(variantParam)
      ? (variantParam as 'quiz' | 'oferta_lp')
      : undefined;
  const rdStatus =
    rdStatusParam &&
    VALID_RD_STATUS.includes(rdStatusParam as StoredLead['rdStatus'])
      ? (rdStatusParam as StoredLead['rdStatus'])
      : undefined;
  const since = sinceParam ? Number(sinceParam) : parseRange(rangeParam);
  const utmSource = utmSourceParam?.trim() || undefined;
  const q = qParam?.trim() || undefined;

  const { items } = await listLeads({
    tier,
    variant,
    rdStatus,
    since: Number.isFinite(since) ? (since as number) : undefined,
    utmSource,
    q,
    limit: 10_000,
  });

  const headers = [
    'Data',
    'Lead ID',
    'Nome',
    'WhatsApp',
    'Email',
    'Tier',
    'Score',
    'Variant',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
    'RD Status',
    'IP',
  ];

  const rows = items.map((lead) => {
    const d = new Date(lead.capturedAt);
    const dateStr = d.toISOString();
    return [
      csvField(dateStr),
      csvField(lead.leadId),
      csvField(lead.payload.name),
      csvField(lead.payload.whatsapp),
      csvField(lead.payload.email ?? ''),
      csvField(lead.tier),
      csvField(lead.score),
      csvField(lead.variant ?? 'quiz'),
      csvField(lead.payload.utms?.utm_source ?? ''),
      csvField(lead.payload.utms?.utm_medium ?? ''),
      csvField(lead.payload.utms?.utm_campaign ?? ''),
      csvField(lead.rdStatus),
      csvField(lead.ip ?? ''),
    ].join(',');
  });

  // BOM no início pra Excel detectar UTF-8 com acentos
  const csv = '﻿' + [headers.map(csvField).join(','), ...rows].join('\n');

  const filename = `jofi-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
