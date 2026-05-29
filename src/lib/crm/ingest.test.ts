import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { StoredLead } from '@/lib/leads/store';

/**
 * Mock muito simples do supabase admin: registra chamadas por tabela
 * (upsert/insert/update) sem implementar query builder real. Suficiente
 * pra verificar contratos do crmIngestLead.
 */

interface MockTableState {
  rows: Map<string, Record<string, unknown>>;
  inserts: Record<string, unknown>[];
  upserts: Record<string, unknown>[];
  updates: Record<string, unknown>[];
}

const TABLES = [
  'crm_leads',
  'crm_conversations',
  'crm_messages',
  'crm_pipeline_stages',
] as const;
type TableName = (typeof TABLES)[number];

const tables: Record<TableName, MockTableState> = {
  crm_leads: { rows: new Map(), inserts: [], upserts: [], updates: [] },
  crm_conversations: { rows: new Map(), inserts: [], upserts: [], updates: [] },
  crm_messages: { rows: new Map(), inserts: [], upserts: [], updates: [] },
  crm_pipeline_stages: { rows: new Map(), inserts: [], upserts: [], updates: [] },
};
let supaShouldBeNull = false;

function resetMockDb() {
  for (const t of TABLES) {
    tables[t].rows.clear();
    tables[t].inserts.length = 0;
    tables[t].upserts.length = 0;
    tables[t].updates.length = 0;
  }
  tables.crm_pipeline_stages.rows.set('stage_novo', {
    id: 'stage_novo',
    name: 'Novo',
    is_default_entry: true,
  });
}

function makeQueryBuilder(table: TableName) {
  let filters: Array<[string, unknown]> = [];

  const findMatching = () => {
    const all = [...tables[table].rows.values()];
    return all.find((r) =>
      filters.every(([f, v]) => r[f] === v),
    );
  };

  const promiseUpdate = (changes: Record<string, unknown>) => {
    tables[table].updates.push({ ...changes, _filters: filters });
    for (const [id, row] of tables[table].rows) {
      if (filters.every(([f, v]) => row[f] === v)) {
        tables[table].rows.set(id, { ...row, ...changes });
      }
    }
    return Promise.resolve({ data: null, error: null });
  };

  const api: Record<string, unknown> = {};
  api.select = (_cols?: string) => api;
  api.eq = (f: string, v: unknown) => {
    filters.push([f, v]);
    return api;
  };
  api.limit = (_n: number) => api;
  api.maybeSingle = async () => ({ data: findMatching() ?? null, error: null });
  api.single = async () => {
    const last = tables[table].inserts[tables[table].inserts.length - 1];
    if (last) return { data: { id: last.id, ...last }, error: null };
    return { data: findMatching() ?? null, error: null };
  };
  api.upsert = async (row: Record<string, unknown>) => {
    tables[table].upserts.push(row);
    const pk = (row.lead_id as string) ?? (row.id as string);
    tables[table].rows.set(pk, row);
    return { data: row, error: null };
  };
  api.insert = (row: Record<string, unknown>) => {
    const id =
      (row.id as string) ?? `${table}_${tables[table].inserts.length + 1}`;
    const stored = { id, ...row };
    tables[table].inserts.push(stored);
    tables[table].rows.set(id, stored);
    return api;
  };
  api.update = (changes: Record<string, unknown>) => promiseUpdate(changes);

  return api as {
    select(c?: string): typeof api;
    eq(f: string, v: unknown): typeof api;
    limit(n: number): typeof api;
    maybeSingle(): Promise<{ data: unknown; error: unknown }>;
    single(): Promise<{ data: unknown; error: unknown }>;
    upsert(
      row: Record<string, unknown>,
      opts?: { onConflict?: string },
    ): Promise<{ data: unknown; error: unknown }>;
    insert(row: Record<string, unknown>): typeof api;
    update(c: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
  };
}

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () => {
    if (supaShouldBeNull) return null;
    return {
      from: (table: TableName) => makeQueryBuilder(table),
    };
  },
  isCrmEnabled: () => !supaShouldBeNull,
}));

import { crmIngestLead } from './ingest';

function makeLead(overrides: Partial<StoredLead> = {}): StoredLead {
  return {
    leadId: `lead_${Math.random().toString(36).slice(2, 10)}`,
    correlationId: 'corr_x',
    capturedAt: Date.now(),
    ip: '127.0.0.1',
    tier: 'quente',
    score: 80,
    variant: 'quiz',
    payload: {
      name: 'Pedro Portella',
      whatsapp: '(81) 99999-8888',
      consent: true,
      tier: 'quente',
      score: 80,
      breakdown: { pet_ativo: 0, gasto: 25, dor: 40, cobertura: 15 },
      answers: { especie: 'cao', idade: 'adulto' },
      utms: { utm_source: 'meta', utm_campaign: 'test' },
    },
    rdStatus: 'sent',
    ...overrides,
  };
}

describe('crmIngestLead', () => {
  beforeEach(() => {
    resetMockDb();
    supaShouldBeNull = false;
    delete process.env.CRM_AUTO_HSM_ENABLED;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retorna crm_disabled quando supabase admin não está configurado', async () => {
    supaShouldBeNull = true;
    const result = await crmIngestLead(makeLead());
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('crm_disabled');
  });

  it('upserta lead e cria conversation quando number é novo', async () => {
    const lead = makeLead();
    const result = await crmIngestLead(lead);
    expect(result.ok).toBe(true);
    expect(result.conversationId).toBeDefined();
    expect(tables.crm_leads.upserts).toHaveLength(1);
    expect(tables.crm_leads.upserts[0]).toMatchObject({
      lead_id: lead.leadId,
      whatsapp_e164: '5581999998888',
      tier: 'quente',
    });
    expect(tables.crm_conversations.inserts).toHaveLength(1);
  });

  it('normaliza whatsapp pra E.164 sem +', async () => {
    const lead = makeLead({
      payload: { ...makeLead().payload, whatsapp: '(11) 98765-4321' },
    });
    await crmIngestLead(lead);
    expect(tables.crm_leads.upserts[0]!.whatsapp_e164).toBe('5511987654321');
  });

  it('quando CRM_AUTO_HSM_ENABLED=false, não tenta enviar HSM', async () => {
    process.env.CRM_AUTO_HSM_ENABLED = 'false';
    const result = await crmIngestLead(makeLead());
    expect(result.hsmSent).toBeFalsy();
    expect(result.reason).toBe('hsm_disabled');
  });

  it('preserva utms expandidos por coluna', async () => {
    await crmIngestLead(makeLead());
    expect(tables.crm_leads.upserts[0]).toMatchObject({
      utm_source: 'meta',
      utm_campaign: 'test',
    });
  });

  it('é idempotente: quando conversation já existe, não cria nova', async () => {
    const lead = makeLead();
    await crmIngestLead(lead);
    // Simula que a conversa já existe pra esse número
    tables.crm_conversations.rows.set('conv1', {
      id: 'conv1',
      lead_id: lead.leadId,
      whatsapp_e164: '5581999998888',
    });
    const insertsBefore = tables.crm_conversations.inserts.length;
    await crmIngestLead(lead);
    expect(tables.crm_conversations.inserts.length).toBe(insertsBefore);
  });
});
