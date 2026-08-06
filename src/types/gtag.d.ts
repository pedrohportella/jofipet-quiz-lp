/**
 * Tipagem global do gtag.js (Google Ads AW-* + GA4).
 *
 * O script é injetado por <GoogleAdsScript /> (afterInteractive), então
 * `window.gtag` só existe depois da hidratação — por isso é opcional aqui.
 * Todo consumidor deve checar `typeof window.gtag === 'function'` antes de usar.
 */
type GtagFn = (
  command: 'js' | 'config' | 'event' | 'set' | 'consent',
  targetOrEventName: string | Date,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: Record<string, unknown>[];
  }
}

export {};
