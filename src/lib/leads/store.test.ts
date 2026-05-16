import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveLead,
  listLeads,
  getLead,
  recordEvent,
  listEvents,
  getFunnelStats,
  _resetForTests,
  type StoredLead,
} from './store';

function makeLead(overrides: Partial<StoredLead> = {}): StoredLead {
  return {
    leadId: `lead_${Math.random().toString(36).slice(2, 10)}`,
    correlationId: 'test',
    capturedAt: Date.now(),
    ip: '127.0.0.1',
    tier: 'quente',
    score: 80,
    variant: 'quiz',
    payload: {
      name: 'Pedro',
      whatsapp: '(81) 99999-8888',
      consent: true,
      tier: 'quente',
      score: 80,
      breakdown: { pet_ativo: 0, gasto: 25, dor: 40, cobertura: 15 },
      answers: { 'pet-ativo': 'sim', especie: 'cao' },
    },
    rdStatus: 'sent',
    ...overrides,
  };
}

describe('lead store (in-memory)', () => {
  beforeEach(() => _resetForTests());

  it('saves and retrieves a lead by id', async () => {
    const lead = makeLead();
    await saveLead(lead);
    const got = await getLead(lead.leadId);
    expect(got?.leadId).toBe(lead.leadId);
  });

  it('lists leads sorted by capturedAt desc', async () => {
    await saveLead(makeLead({ capturedAt: 1000 }));
    await saveLead(makeLead({ capturedAt: 3000 }));
    await saveLead(makeLead({ capturedAt: 2000 }));
    const { items } = await listLeads();
    expect(items.map((l) => l.capturedAt)).toEqual([3000, 2000, 1000]);
  });

  it('filters leads by tier', async () => {
    await saveLead(makeLead({ tier: 'quente' }));
    await saveLead(makeLead({ tier: 'morno' }));
    await saveLead(makeLead({ tier: 'frio' }));
    const { items } = await listLeads({ tier: 'morno' });
    expect(items).toHaveLength(1);
    expect(items[0]!.tier).toBe('morno');
  });

  it('paginates with limit + offset', async () => {
    for (let i = 0; i < 25; i++) {
      await saveLead(makeLead({ capturedAt: i }));
    }
    const page1 = await listLeads({ limit: 10, offset: 0 });
    const page2 = await listLeads({ limit: 10, offset: 10 });
    expect(page1.items).toHaveLength(10);
    expect(page2.items).toHaveLength(10);
    expect(page1.total).toBe(25);
  });

  it('returns null for unknown lead id', async () => {
    expect(await getLead('does-not-exist')).toBeNull();
  });
});

describe('funnel events store', () => {
  beforeEach(() => _resetForTests());

  it('records events with id + ts', async () => {
    await recordEvent({ type: 'quiz_started' });
    const events = await listEvents();
    expect(events).toHaveLength(1);
    expect(events[0]!.eventId).toMatch(/^evt_/);
    expect(events[0]!.ts).toBeGreaterThan(0);
  });

  it('listEvents returns most recent first', async () => {
    await recordEvent({ type: 'quiz_started' });
    await new Promise((r) => setTimeout(r, 5));
    await recordEvent({ type: 'lead_captured', tier: 'quente' });
    const events = await listEvents();
    expect(events[0]!.type).toBe('lead_captured');
    expect(events[1]!.type).toBe('quiz_started');
  });
});

describe('getFunnelStats', () => {
  beforeEach(() => _resetForTests());

  it('aggregates totals by event type', async () => {
    await recordEvent({ type: 'quiz_started' });
    await recordEvent({ type: 'quiz_started' });
    await recordEvent({ type: 'quiz_complete', tier: 'quente' });
    await recordEvent({ type: 'lead_captured', tier: 'quente' });
    const stats = await getFunnelStats();
    expect(stats.totals.quiz_started).toBe(2);
    expect(stats.totals.quiz_complete).toBe(1);
    expect(stats.totals.lead_captured).toBe(1);
  });

  it('groups leads by tier and utm_source', async () => {
    await saveLead(
      makeLead({
        tier: 'quente',
        payload: {
          ...makeLead().payload,
          utms: { utm_source: 'instagram' },
        } as StoredLead['payload'],
      }),
    );
    await saveLead(
      makeLead({
        tier: 'morno',
        payload: {
          ...makeLead().payload,
          utms: { utm_source: 'instagram' },
        } as StoredLead['payload'],
      }),
    );
    const stats = await getFunnelStats();
    expect(stats.byTier.quente).toBe(1);
    expect(stats.byTier.morno).toBe(1);
    expect(stats.byUtmSource.instagram).toBe(2);
  });

  it('computes conversion rates correctly', async () => {
    await recordEvent({ type: 'quiz_started' });
    await recordEvent({ type: 'quiz_started' });
    await recordEvent({ type: 'quiz_complete' });
    await recordEvent({ type: 'lead_captured' });
    const stats = await getFunnelStats();
    expect(stats.conversionRate.quizStartToComplete).toBe(0.5);
    expect(stats.conversionRate.completeToCapture).toBe(1);
  });
});
