import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkIdempotency,
  recordIdempotent,
  _resetForTests,
} from './idempotency';
import type { LeadPayload } from '@/lib/validation/schemas';

function makePayload(overrides: Partial<LeadPayload> = {}): LeadPayload {
  return {
    name: 'Pedro',
    whatsapp: '(81) 99999-8888',
    consent: true,
    tier: 'quente',
    score: 80,
    breakdown: { pet_ativo: 0, gasto: 25, dor: 40, cobertura: 15 },
    answers: { 'pet-ativo': 'sim' },
    ...overrides,
  };
}

describe('idempotency', () => {
  beforeEach(() => _resetForTests());

  it('returns null on first request', () => {
    expect(checkIdempotency(makePayload())).toBeNull();
  });

  it('returns cached response on duplicate within 30s', () => {
    const payload = makePayload();
    recordIdempotent(payload, {
      leadId: 'lead_abc',
      correlationId: 'lead_abc',
      warning: 'rd_token_missing',
    });
    const got = checkIdempotency(payload);
    expect(got?.leadId).toBe('lead_abc');
    expect(got?.warning).toBe('rd_token_missing');
  });

  it('treats different whatsapp as different requests', () => {
    recordIdempotent(makePayload({ whatsapp: '(81) 99999-8888' }), {
      leadId: 'lead_a',
      correlationId: 'lead_a',
    });
    expect(
      checkIdempotency(makePayload({ whatsapp: '(81) 99999-1111' })),
    ).toBeNull();
  });

  it('treats different tier as different requests', () => {
    recordIdempotent(makePayload({ tier: 'quente' }), {
      leadId: 'lead_a',
      correlationId: 'lead_a',
    });
    expect(checkIdempotency(makePayload({ tier: 'morno' }))).toBeNull();
  });

  it('normalizes whatsapp formatting (mask vs digits = same lead)', () => {
    const masked = makePayload({ whatsapp: '(81) 99999-8888' });
    const digits = makePayload({ whatsapp: '81999998888' });
    recordIdempotent(masked, {
      leadId: 'lead_a',
      correlationId: 'lead_a',
    });
    expect(checkIdempotency(digits)?.leadId).toBe('lead_a');
  });
});
