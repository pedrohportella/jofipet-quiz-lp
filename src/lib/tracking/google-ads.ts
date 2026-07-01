/* eslint-disable @typescript-eslint/no-explicit-any */
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

type GtagFn = (...args: any[]) => void;

interface WindowWithGtag extends Window {
  gtag?: GtagFn;
  dataLayer?: Record<string, unknown>[];
}

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

  const gtag = (window as WindowWithGtag).gtag;
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
