/**
 * Google Ads conversion tracking.
 *
 * Configuração via env:
 *   NEXT_PUBLIC_GOOGLE_ADS_ID              — ex: AW-1234567890
 *   NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL — label da conversão (parte após "/" no send_to)
 *
 * Se qualquer um dos dois estiver vazio, os disparos viram no-op silencioso —
 * útil pra manter a página funcional em dev/preview antes do Gabriel entregar os IDs.
 */

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? '';
export const GOOGLE_ADS_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ?? '';

export function isGoogleAdsConfigured(): boolean {
  return GOOGLE_ADS_ID.length > 0 && GOOGLE_ADS_CONVERSION_LABEL.length > 0;
}

export interface ConversionPayload {
  /** Valor monetário associado à conversão (opcional). */
  value?: number;
  /** ISO 4217 currency code. Default: BRL. */
  currency?: string;
  /** ID único do lead pra deduplicação server-side. */
  transactionId?: string;
}

/**
 * Dispara o evento de conversão do Google Ads (send_to = AW-.../LABEL).
 * No-op quando gtag ausente ou envs vazias.
 */
export function fireGoogleAdsConversion(payload: ConversionPayload = {}): void {
  if (typeof window === 'undefined') return;
  if (!isGoogleAdsConfigured()) return;

  const gtag = window.gtag;
  if (typeof gtag !== 'function') return;

  const params: Record<string, unknown> = {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    currency: payload.currency ?? 'BRL',
  };
  if (typeof payload.value === 'number' && Number.isFinite(payload.value)) {
    params.value = payload.value;
  }
  if (payload.transactionId) {
    params.transaction_id = payload.transactionId;
  }

  try {
    gtag('event', 'conversion', params);
  } catch {
    // Tracking nunca deve quebrar UX
  }
}

/**
 * Chaves de jornada já convertidas nesta sessão de página.
 *
 * O lead pode chegar no WhatsApp por caminhos que se sobrepõem (ex: no
 * /resultado o auto-redirect e o botão manual disputam o mesmo clique).
 * Sem guarda, a mesma ida pro WhatsApp viraria 2 conversões e inflaria a
 * campanha. Escopo é o módulo (reseta a cada page load), que é exatamente
 * a granularidade de "uma jornada".
 */
const reportedJourneys = new Set<string>();

export interface WhatsAppConversionOptions extends ConversionPayload {
  /**
   * Onde o lead entrou no WhatsApp — só pra dedup e leitura do código.
   * NÃO é enviado ao Google Ads (a ação de conversão é única).
   */
  source:
    | 'oferta_modal'
    | 'quiz_capture'
    | 'resultado_cta'
    | 'resultado_auto_redirect';
  /**
   * Chave de deduplicação da jornada. Mesma chave = conta uma vez só.
   * Default: o próprio `source`. Passe o leadId quando dois componentes
   * diferentes puderem mandar o MESMO lead pro WhatsApp.
   */
  dedupeKey?: string;
}

/**
 * Registra a conversão "Clique WhatsApp" do Google Ads.
 *
 * Ponto único de disparo pra TODOS os CTAs de WhatsApp do funil — chame no
 * momento em que o lead de fato vai pro WhatsApp (não no clique que só abre
 * um modal), pra não treinar o Smart Bidding com quem abandona o formulário.
 *
 * Não bloqueia nem atrasa a navegação: o gtag despacha o hit de forma
 * assíncrona e o link/redirect segue normalmente. Sem `event_callback` de
 * propósito — ele é redundante aqui e adicionaria latência ao redirect.
 *
 * Seguro por construção: no-op silencioso se rodar no server, se as envs
 * não estiverem setadas ou se o gtag ainda não tiver carregado.
 */
export function reportWhatsAppConversion(
  options: WhatsAppConversionOptions,
): void {
  const { source, dedupeKey, ...payload } = options;

  const key = dedupeKey ?? source;
  if (reportedJourneys.has(key)) return;
  reportedJourneys.add(key);

  fireGoogleAdsConversion(payload);
}
