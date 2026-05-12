const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type Utms = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = 'jofi-utms-v1';

export function extractUtmsFromSearch(search: string): Utms {
  const params = new URLSearchParams(search);
  const utms: Utms = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) utms[key] = value;
  }
  return utms;
}

export function loadStoredUtms(): Utms {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Utms;
  } catch {
    return {};
  }
}

export function storeUtms(utms: Utms): void {
  if (typeof window === 'undefined') return;
  if (Object.keys(utms).length === 0) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utms));
  } catch {
    // sessionStorage blocked — ignore silently
  }
}

export function captureUtmsFromUrl(): Utms {
  if (typeof window === 'undefined') return {};
  const fresh = extractUtmsFromSearch(window.location.search);
  if (Object.keys(fresh).length > 0) {
    storeUtms(fresh);
    return fresh;
  }
  return loadStoredUtms();
}

export function appendUtmsToUrl(baseUrl: string, utms: Utms): string {
  try {
    const url = new URL(baseUrl);
    for (const key of UTM_KEYS) {
      const value = utms[key];
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}
