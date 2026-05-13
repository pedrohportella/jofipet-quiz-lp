import { describe, it, expect } from 'vitest';
import { buildRdConversionPayload } from './mapper';
import type { LeadPayload } from '@/lib/validation/schemas';

const base: LeadPayload = {
  name: 'Maria Silva',
  whatsapp: '(81) 99999-8888',
  email: 'maria@example.com',
  consent: true,
  tier: 'quente',
  score: 80,
  breakdown: { pet_ativo: 0, gasto: 25, dor: 40, cobertura: 15 },
  answers: {
    'pet-ativo': 'sim',
    especie: 'cao',
    idade: 'idoso',
    'gasto-mensal': 250,
    cep: '50050-100',
  },
};

describe('buildRdConversionPayload', () => {
  it('builds a CONVERSION/CDP envelope', () => {
    const out = buildRdConversionPayload(base);
    expect(out.event_type).toBe('CONVERSION');
    expect(out.event_family).toBe('CDP');
  });

  it('sets conversion_identifier per tier', () => {
    expect(buildRdConversionPayload(base).payload.conversion_identifier).toBe(
      'jofipet-quiz-quente',
    );
    expect(
      buildRdConversionPayload({ ...base, tier: 'morno' }).payload.conversion_identifier,
    ).toBe('jofipet-quiz-morno');
  });

  it('normalizes phone to E.164 BR', () => {
    expect(buildRdConversionPayload(base).payload.mobile_phone).toBe(
      '+5581999998888',
    );
  });

  it('uses real email when provided', () => {
    expect(buildRdConversionPayload(base).payload.email).toBe('maria@example.com');
  });

  it('falls back to placeholder email when none provided', () => {
    const out = buildRdConversionPayload({ ...base, email: undefined });
    expect(out.payload.email).toMatch(/^mariasilva-\d+@no-email\.jofipet\.local$/);
  });

  it('tags include lead-{tier} and quiz-jofipet', () => {
    expect(buildRdConversionPayload(base).payload.tags).toEqual([
      'lead-quente',
      'quiz-jofipet',
    ]);
  });

  it('maps known answers to canonical cf_ fields', () => {
    const out = buildRdConversionPayload(base);
    expect(out.payload.cf_pet_especie).toBe('cao');
    expect(out.payload.cf_pet_idade).toBe('idoso');
    expect(out.payload.cf_gasto_mensal).toBe(250);
    expect(out.payload.cf_cep).toBe('50050-100');
  });

  it('flattens score and breakdown to cf_ fields', () => {
    const out = buildRdConversionPayload(base);
    expect(out.payload.cf_quiz_tier).toBe('quente');
    expect(out.payload.cf_quiz_score).toBe(80);
    expect(out.payload.cf_quiz_breakdown_gasto).toBe(25);
    expect(out.payload.cf_quiz_breakdown_dor).toBe(40);
    expect(out.payload.cf_quiz_breakdown_cobertura).toBe(15);
  });

  it('passes through utms with cf_ prefix when present', () => {
    const out = buildRdConversionPayload({
      ...base,
      utms: { utm_source: 'instagram', utm_campaign: 'lancamento' },
    });
    expect(out.payload.cf_utm_source).toBe('instagram');
    expect(out.payload.cf_utm_campaign).toBe('lancamento');
    expect('cf_utm_medium' in out.payload).toBe(false);
  });

  it('joins array answers with comma', () => {
    const out = buildRdConversionPayload({
      ...base,
      answers: { ...base.answers, preocupacoes: ['saude', 'custo'] },
    });
    expect(out.payload.cf_preocupacoes).toBe('saude,custo');
  });

  it('handles unknown answer keys with generic cf_ prefix', () => {
    const out = buildRdConversionPayload({
      ...base,
      answers: { ...base.answers, 'campo-custom-novo': 'valor' },
    });
    expect(out.payload['cf_campo-custom-novo']).toBe('valor');
  });
});
