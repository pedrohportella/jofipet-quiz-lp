import { describe, it, expect } from 'vitest';
import type { StoredLead } from '@/lib/leads/store';
import { buildDealPayload, getPredictionValue } from './mapper';
import type { RdCrmConfig } from './config';

const cfg: RdCrmConfig = {
  token: 'fake_token',
  dealStageId: 'stage_abc',
  defaultUserId: 'user_xyz',
  apiBaseUrl: 'https://crm.rdstation.com/api/v1',
};

function makeLead(overrides: Partial<StoredLead> = {}): StoredLead {
  return {
    leadId: 'lead_1',
    correlationId: 'corr_1',
    capturedAt: new Date('2026-05-29T10:00:00Z').getTime(),
    ip: '127.0.0.1',
    tier: 'quente',
    score: 85,
    variant: 'quiz',
    payload: {
      name: 'Pedro Portella',
      whatsapp: '(81) 99999-8888',
      email: 'pedro@example.com',
      consent: true,
      tier: 'quente',
      score: 85,
      breakdown: { pet_ativo: 0, gasto: 25, dor: 40, cobertura: 20 },
      answers: { especie: 'cao' },
    },
    rdStatus: 'sent',
    ...overrides,
  };
}

describe('buildDealPayload', () => {
  it('monta deal.name no formato "{nome} (Quiz Jofi)"', () => {
    const p = buildDealPayload(makeLead(), cfg);
    expect(p.deal.name).toBe('Pedro Portella (Quiz Jofi)');
  });

  it('atribui deal_stage_id do config', () => {
    const p = buildDealPayload(makeLead(), cfg);
    expect(p.deal.deal_stage_id).toBe('stage_abc');
  });

  it('inclui user_id quando defaultUserId está configurado', () => {
    const p = buildDealPayload(makeLead(), cfg);
    expect(p.deal.user_id).toBe('user_xyz');
  });

  it('omite user_id quando defaultUserId não está configurado', () => {
    const p = buildDealPayload(makeLead(), { ...cfg, defaultUserId: undefined });
    expect(p.deal.user_id).toBeUndefined();
  });

  it('rating reflete o tier (quente=3, morno=2, frio=1)', () => {
    expect(buildDealPayload(makeLead({ tier: 'quente' }), cfg).deal.rating).toBe(3);
    expect(buildDealPayload(makeLead({ tier: 'morno' }), cfg).deal.rating).toBe(2);
    expect(buildDealPayload(makeLead({ tier: 'frio' }), cfg).deal.rating).toBe(1);
  });

  it('phone vai como dígitos puros no formato E.164 sem +', () => {
    const p = buildDealPayload(makeLead(), cfg);
    expect(p.contacts[0]!.phones?.[0]).toEqual({
      phone: '5581999998888',
      type: 'cellphone',
    });
  });

  it('inclui emails quando lead tem email', () => {
    const p = buildDealPayload(makeLead(), cfg);
    expect(p.contacts[0]!.emails).toEqual([{ email: 'pedro@example.com' }]);
  });

  it('omite emails quando lead não tem email', () => {
    const lead = makeLead({
      payload: { ...makeLead().payload, email: undefined },
    });
    const p = buildDealPayload(lead, cfg);
    expect(p.contacts[0]!.emails).toBeUndefined();
  });

  it('prediction_date é 7 dias depois de capturedAt em formato YYYY-MM-DD', () => {
    const lead = makeLead({
      capturedAt: new Date('2026-05-29T10:00:00Z').getTime(),
    });
    const p = buildDealPayload(lead, cfg);
    expect(p.deal.prediction_date).toBe('2026-06-05');
  });

  it('não inclui custom_fields no MVP', () => {
    const p = buildDealPayload(makeLead(), cfg);
    expect(p.deal.deal_custom_fields).toBeUndefined();
  });
});

describe('getPredictionValue', () => {
  it('retorna valor por tier', () => {
    expect(getPredictionValue('quente')).toBe(89.9);
    expect(getPredictionValue('morno')).toBe(49.9);
    expect(getPredictionValue('frio')).toBe(0);
  });
});
