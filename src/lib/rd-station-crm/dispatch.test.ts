import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { StoredLead } from '@/lib/leads/store';

const originalEnv = { ...process.env };

function makeLead(overrides: Partial<StoredLead> = {}): StoredLead {
  return {
    leadId: 'lead_1',
    correlationId: 'corr_1',
    capturedAt: Date.now(),
    ip: '127.0.0.1',
    tier: 'quente',
    score: 85,
    variant: 'quiz',
    payload: {
      name: 'Pedro',
      whatsapp: '(81) 99999-8888',
      consent: true,
      tier: 'quente',
      score: 85,
      breakdown: { pet_ativo: 0, gasto: 25, dor: 40, cobertura: 20 },
      answers: {},
    },
    rdStatus: 'sent',
    ...overrides,
  };
}

describe('dispatchRdCrmDeal', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.RD_CRM_TOKEN;
    delete process.env.RD_CRM_DEAL_STAGE_ID;
    delete process.env.RD_CRM_DEFAULT_USER_ID;
    // Por padrão habilita pros testes que validam o fluxo "happy path".
    // Tests específicos da feature flag desligada sobrescrevem.
    process.env.RD_CRM_ENABLED = 'true';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
  });

  it('skipa quando feature flag off (RD_CRM_ENABLED diferente de "true")', async () => {
    process.env.RD_CRM_ENABLED = 'false';
    process.env.RD_CRM_TOKEN = 't';
    process.env.RD_CRM_DEAL_STAGE_ID = 's';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead({ tier: 'quente' }));

    expect(r.ok).toBe(true);
    expect(r.skipped).toBe('feature_disabled');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skipa quando feature flag ausente (default off)', async () => {
    delete process.env.RD_CRM_ENABLED;
    process.env.RD_CRM_TOKEN = 't';
    process.env.RD_CRM_DEAL_STAGE_ID = 's';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead({ tier: 'quente' }));

    expect(r.ok).toBe(true);
    expect(r.skipped).toBe('feature_disabled');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('skipa tier frio sem chamar fetch', async () => {
    process.env.RD_CRM_TOKEN = 't';
    process.env.RD_CRM_DEAL_STAGE_ID = 's';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead({ tier: 'frio' }));

    expect(r.ok).toBe(true);
    expect(r.skipped).toBe('tier_not_eligible');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('retorna config_missing quando token ausente', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead());

    expect(r.ok).toBe(false);
    expect(r.skipped).toBe('config_missing');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('cria deal quando tier quente + config ok', async () => {
    process.env.RD_CRM_TOKEN = 'tok';
    process.env.RD_CRM_DEAL_STAGE_ID = 'stage_abc';
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ _id: 'deal_xyz', name: 'Pedro (Quiz Jofi)' }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead({ tier: 'quente' }));

    expect(r.ok).toBe(true);
    expect(r.dealId).toBe('deal_xyz');
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toContain('crm.rdstation.com/api/v1/deals');
    expect(url).toContain('token=tok');
    expect((init as RequestInit).method).toBe('POST');
  });

  it('cria deal pra tier morno também', async () => {
    process.env.RD_CRM_TOKEN = 'tok';
    process.env.RD_CRM_DEAL_STAGE_ID = 'stage_abc';
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ _id: 'deal_morno' }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead({ tier: 'morno' }));

    expect(r.ok).toBe(true);
    expect(r.dealId).toBe('deal_morno');
  });

  it('captura erro 422 do RD sem propagar exception', async () => {
    process.env.RD_CRM_TOKEN = 'tok';
    process.env.RD_CRM_DEAL_STAGE_ID = 'stage_abc';
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ errors: { deal_stage_id: ['inválido'] } }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead({ tier: 'quente' }));

    expect(r.ok).toBe(false);
    expect(r.errorStatus).toBe(422);
    expect(r.retryable).toBe(false);
  });

  it('marca 5xx como retryable', async () => {
    process.env.RD_CRM_TOKEN = 'tok';
    process.env.RD_CRM_DEAL_STAGE_ID = 'stage_abc';
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead({ tier: 'quente' }));

    expect(r.ok).toBe(false);
    expect(r.retryable).toBe(true);
  });

  it('nunca propaga exception (fail-safe)', async () => {
    process.env.RD_CRM_TOKEN = 'tok';
    process.env.RD_CRM_DEAL_STAGE_ID = 'stage_abc';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('socket exploded')),
    );

    const { dispatchRdCrmDeal } = await import('./dispatch');
    const r = await dispatchRdCrmDeal(makeLead({ tier: 'quente' }));

    expect(r.ok).toBe(false);
    expect(r.retryable).toBe(true);
  });
});
