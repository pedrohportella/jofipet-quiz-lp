/* eslint-disable @typescript-eslint/no-explicit-any */
// GA4 wrapper sobre gtag.

type GtagFn = (...args: any[]) => void;

interface WindowWithGtag extends Window {
  gtag?: GtagFn;
  dataLayer?: Record<string, unknown>[];
}

export function hasGa(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as WindowWithGtag).gtag === 'function';
}

export function gaEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  try {
    if (!hasGa()) return;
    (window as WindowWithGtag).gtag!('event', name, params ?? {});
  } catch {
    // Silent — tracking never breaks UX
  }
}
