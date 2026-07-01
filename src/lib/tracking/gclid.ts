/**
 * Captura, persiste e recupera o gclid (Google Click ID) enviado
 * pelo Google Ads na URL de destino do anúncio.
 *
 * Mantido separado de utms.ts porque:
 *   - gclid NÃO é UTM canônico e não deve ir para APIs de lead que validam
 *     o objeto Utms via Zod.
 *   - Pode viver mais tempo (persistência entre sessões via localStorage).
 *
 * Preserva também `gbraid` e `wbraid` (iOS/App conversions do Google Ads).
 */
const STORAGE_KEY = 'jofi-gclid-v1';
const KEYS = ['gclid', 'gbraid', 'wbraid'] as const;

type GoogleClickKey = (typeof KEYS)[number];
export type GoogleClickIds = Partial<Record<GoogleClickKey, string>>;

export function extractGoogleClickIdsFromSearch(search: string): GoogleClickIds {
  const params = new URLSearchParams(search);
  const ids: GoogleClickIds = {};
  for (const key of KEYS) {
    const value = params.get(key);
    if (value) ids[key] = value;
  }
  return ids;
}

export function loadStoredGoogleClickIds(): GoogleClickIds {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as GoogleClickIds;
  } catch {
    return {};
  }
}

export function storeGoogleClickIds(ids: GoogleClickIds): void {
  if (typeof window === 'undefined') return;
  if (Object.keys(ids).length === 0) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // storage indisponível — silencioso
  }
}

/** Captura os IDs da URL atual e persiste. Usar no mount raiz. */
export function captureGoogleClickIdsFromUrl(): GoogleClickIds {
  if (typeof window === 'undefined') return {};
  const fresh = extractGoogleClickIdsFromSearch(window.location.search);
  if (Object.keys(fresh).length > 0) {
    storeGoogleClickIds(fresh);
    return fresh;
  }
  return loadStoredGoogleClickIds();
}

/** Anexa gclid/gbraid/wbraid a uma URL, sem sobrescrever se já existirem. */
export function appendGoogleClickIdsToUrl(
  baseUrl: string,
  ids: GoogleClickIds,
): string {
  try {
    const url = new URL(baseUrl);
    for (const key of KEYS) {
      const value = ids[key];
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}
