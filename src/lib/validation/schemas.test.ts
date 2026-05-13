import { describe, it, expect } from 'vitest';
import {
  CaptureFormSchema,
  LeadPayloadSchema,
  normalizeWhatsappToE164,
} from './schemas';

describe('CaptureFormSchema', () => {
  const validFull = {
    name: 'Pedro Portella',
    whatsapp: '(81) 99999-8888',
    email: 'pedro@example.com',
    consent: true as const,
  };

  it('accepts a fully valid form', () => {
    expect(CaptureFormSchema.safeParse(validFull).success).toBe(true);
  });

  it('accepts empty email (optional field)', () => {
    const result = CaptureFormSchema.safeParse({ ...validFull, email: '' });
    expect(result.success).toBe(true);
  });

  it('rejects name with numbers', () => {
    const result = CaptureFormSchema.safeParse({ ...validFull, name: 'Pedro 123' });
    expect(result.success).toBe(false);
  });

  it('rejects whatsapp without proper mask', () => {
    const cases = ['81999998888', '(81)99999-8888aaa', '81 99999 8888', ''];
    for (const wpp of cases) {
      expect(
        CaptureFormSchema.safeParse({ ...validFull, whatsapp: wpp }).success,
      ).toBe(false);
    }
  });

  it('accepts whatsapp with or without leading 9', () => {
    expect(
      CaptureFormSchema.safeParse({ ...validFull, whatsapp: '(11) 91234-5678' })
        .success,
    ).toBe(true);
    expect(
      CaptureFormSchema.safeParse({ ...validFull, whatsapp: '(11) 1234-5678' })
        .success,
    ).toBe(true);
  });

  it('rejects when consent is not true', () => {
    const result = CaptureFormSchema.safeParse({ ...validFull, consent: false });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = CaptureFormSchema.safeParse({
      ...validFull,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });
});

describe('LeadPayloadSchema (server-side)', () => {
  const basePayload = {
    name: 'Maria Silva',
    whatsapp: '(81) 99999-8888',
    consent: true as const,
    tier: 'quente' as const,
    score: 80,
    breakdown: { pet_ativo: 0, gasto: 25, dor: 40, cobertura: 15 },
    answers: { 'pet-ativo': 'sim', idade: 'idoso' },
  };

  it('accepts minimal valid payload', () => {
    expect(LeadPayloadSchema.safeParse(basePayload).success).toBe(true);
  });

  it('accepts payload with utms and turnstileToken', () => {
    const result = LeadPayloadSchema.safeParse({
      ...basePayload,
      utms: { utm_source: 'instagram', utm_campaign: 'lancamento' },
      turnstileToken: 'tk_abc123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown tier value', () => {
    const result = LeadPayloadSchema.safeParse({ ...basePayload, tier: 'extra-quente' });
    expect(result.success).toBe(false);
  });

  it('transforms empty email to undefined', () => {
    const result = LeadPayloadSchema.safeParse({ ...basePayload, email: '' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
    }
  });
});

describe('normalizeWhatsappToE164', () => {
  it('strips mask and adds +55', () => {
    expect(normalizeWhatsappToE164('(81) 99999-8888')).toBe('+5581999998888');
  });

  it('handles unmasked digits', () => {
    expect(normalizeWhatsappToE164('81999998888')).toBe('+5581999998888');
  });

  it('handles short whatsapp (without leading 9)', () => {
    expect(normalizeWhatsappToE164('(11) 1234-5678')).toBe('+551112345678');
  });
});
