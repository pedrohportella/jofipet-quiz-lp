// GA4 wrapper sobre gtag. Tipagem de window.gtag vem de src/types/gtag.d.ts.

export function hasGa(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.gtag === 'function';
}

export function gaEvent(
  name: string,
  params?: Record<string, unknown>,
): void {
  try {
    if (!hasGa()) return;
    window.gtag!('event', name, params ?? {});
  } catch {
    // Silent — tracking never breaks UX
  }
}
