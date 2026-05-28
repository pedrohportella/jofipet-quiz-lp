import { describe, it, expect } from 'vitest';
import {
  buildWhatsappMessage,
  buildWhatsappUrl,
  _internals,
} from './whatsapp';

describe('buildWhatsappMessage', () => {
  it('inserts the invisible quiz marker between the first and second character', () => {
    const msg = buildWhatsappMessage({
      tier: 'quente',
      especie: 'cao',
      idade: 'adulto',
    });
    expect(msg.startsWith('O')).toBe(true);
    expect(msg.slice(1, 6)).toBe(_internals.QUIZ_INVISIBLE_MARKER);
  });

  it('uses Parceiro for quente tier', () => {
    const msg = buildWhatsappMessage({ tier: 'quente' });
    expect(msg).toContain('Parceiro');
    expect(msg).toContain('R$ 169,90');
  });

  it('uses Sereno for morno tier', () => {
    const msg = buildWhatsappMessage({ tier: 'morno' });
    expect(msg).toContain('Sereno');
    expect(msg).toContain('R$ 79,90');
  });

  it('uses Sereninho for frio tier', () => {
    const msg = buildWhatsappMessage({ tier: 'frio' });
    expect(msg).toContain('Sereninho');
    expect(msg).toContain('R$ 49,90');
  });

  it('humanizes especie + idade', () => {
    const msg = buildWhatsappMessage({
      tier: 'quente',
      especie: 'gato',
      idade: 'idoso',
    });
    expect(msg).toContain('gatinho idoso');
  });

  it('falls back to "pet" when especie unknown', () => {
    const msg = buildWhatsappMessage({
      tier: 'quente',
      especie: 'lagarto',
    });
    expect(msg).toContain('pet');
  });

  it('omits idade if not provided', () => {
    const msg = buildWhatsappMessage({ tier: 'quente', especie: 'cao' });
    expect(msg).toContain('cãozinho');
    expect(msg).not.toContain('undefined');
  });
});

describe('buildWhatsappUrl', () => {
  it('produces api.whatsapp.com URL with phone + text params', () => {
    const url = buildWhatsappUrl('558007779745', {
      tier: 'quente',
      especie: 'cao',
      idade: 'adulto',
    });
    expect(url.startsWith('https://api.whatsapp.com/send/?')).toBe(true);
    expect(url).toContain('phone=558007779745');
    expect(url).toContain('text=');
  });

  it('preserves utm_source when provided', () => {
    const url = buildWhatsappUrl('558007779745', {
      tier: 'morno',
      utms: { utm_source: 'instagram' },
    });
    expect(url).toContain('utm_source=instagram');
  });

  it('falls back to utm_source=site when utms not provided', () => {
    const url = buildWhatsappUrl('558007779745', { tier: 'frio' });
    expect(url).toContain('utm_source=site');
  });

  it('attaches canonical quiz UTMs (medium + campaign + content + term)', () => {
    const url = buildWhatsappUrl('558007779745', { tier: 'quente' });
    expect(url).toContain('utm_medium=whatsapp');
    expect(url).toContain('utm_campaign=quiz');
    expect(url).toContain('utm_content=quente');
    expect(url).toContain('utm_term=quiz_completo');
  });

  it('attaches oferta_lp UTMs when source=oferta_lp + selectedPlanId', () => {
    const url = buildWhatsappUrl('558007779745', {
      source: 'oferta_lp',
      selectedPlanId: 'sereno',
    });
    expect(url).toContain('utm_campaign=oferta_lp');
    expect(url).toContain('utm_content=sereno');
    expect(url).toContain('utm_term=plan_card');
  });
});
