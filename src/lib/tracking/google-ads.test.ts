/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const ADS_ID = 'AW-18348960280';
const LABEL = 'sHB0CKufsdscEJjUu61E';
const SEND_TO = `${ADS_ID}/${LABEL}`;

/**
 * GOOGLE_ADS_ID / GOOGLE_ADS_CONVERSION_LABEL são lidos de process.env no
 * topo do módulo, então cada cenário precisa reimportar o módulo depois de
 * stubar as envs. resetModules() também zera a guarda de dedup entre testes.
 */
async function loadModule(id = ADS_ID, label = LABEL) {
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADS_ID', id);
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL', label);
  vi.resetModules();
  return import('./google-ads');
}

describe('google-ads conversion tracking', () => {
  beforeEach(() => {
    window.gtag = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reportWhatsAppConversion dispara o evento conversion com o send_to correto', async () => {
    const { reportWhatsAppConversion } = await loadModule();

    reportWhatsAppConversion({ source: 'oferta_modal' });

    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: SEND_TO,
      currency: 'BRL',
    });
  });

  it('inclui value e transaction_id quando fornecidos', async () => {
    const { reportWhatsAppConversion } = await loadModule();

    reportWhatsAppConversion({
      source: 'quiz_capture',
      value: 89.9,
      transactionId: 'lead_123',
    });

    expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', {
      send_to: SEND_TO,
      currency: 'BRL',
      value: 89.9,
      transaction_id: 'lead_123',
    });
  });

  it('não envia source nem dedupeKey pro Google Ads', async () => {
    const { reportWhatsAppConversion } = await loadModule();

    reportWhatsAppConversion({ source: 'resultado_cta', dedupeKey: 'lead_9' });

    const params = (window.gtag as any).mock.calls[0][2];
    expect(params).not.toHaveProperty('source');
    expect(params).not.toHaveProperty('dedupeKey');
  });

  it('deduplica a mesma jornada: dois disparos com a mesma chave contam uma vez', async () => {
    const { reportWhatsAppConversion } = await loadModule();

    // Cenário real do /resultado: auto-redirect e botão manual, mesmo lead.
    reportWhatsAppConversion({
      source: 'resultado_auto_redirect',
      dedupeKey: 'lead_abc',
    });
    reportWhatsAppConversion({ source: 'resultado_cta', dedupeKey: 'lead_abc' });

    expect(window.gtag).toHaveBeenCalledTimes(1);
  });

  it('leads diferentes continuam contando separadamente', async () => {
    const { reportWhatsAppConversion } = await loadModule();

    reportWhatsAppConversion({ source: 'oferta_modal', dedupeKey: 'lead_1' });
    reportWhatsAppConversion({ source: 'oferta_modal', dedupeKey: 'lead_2' });

    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('sem dedupeKey, cai no source como chave', async () => {
    const { reportWhatsAppConversion } = await loadModule();

    reportWhatsAppConversion({ source: 'oferta_modal' });
    reportWhatsAppConversion({ source: 'oferta_modal' });
    reportWhatsAppConversion({ source: 'quiz_capture' });

    expect(window.gtag).toHaveBeenCalledTimes(2);
  });

  it('é no-op silencioso quando o gtag ainda não carregou', async () => {
    const { reportWhatsAppConversion } = await loadModule();
    window.gtag = undefined;

    expect(() =>
      reportWhatsAppConversion({ source: 'oferta_modal' }),
    ).not.toThrow();
  });

  it('é no-op quando a label de conversão não está configurada', async () => {
    const { reportWhatsAppConversion } = await loadModule(ADS_ID, '');

    reportWhatsAppConversion({ source: 'oferta_modal' });

    expect(window.gtag).not.toHaveBeenCalled();
  });

  it('não quebra a UX se o gtag lançar exceção', async () => {
    const { reportWhatsAppConversion } = await loadModule();
    window.gtag = vi.fn(() => {
      throw new Error('gtag explodiu');
    });

    expect(() =>
      reportWhatsAppConversion({ source: 'oferta_modal' }),
    ).not.toThrow();
  });
});
