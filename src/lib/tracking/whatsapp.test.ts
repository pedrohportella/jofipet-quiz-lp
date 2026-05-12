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

  it('omits utm_source when utms not provided', () => {
    const url = buildWhatsappUrl('558007779745', { tier: 'frio' });
    expect(url).not.toContain('utm_source');
  });
});
