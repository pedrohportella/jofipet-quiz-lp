import { createHash } from 'node:crypto';
import { normalizeWhatsappToE164 } from '@/lib/validation/schemas';

/**
 * Meta Conversions API (CAPI) client — server-side event tracking.
 *
 * Why: client-side Meta Pixel loses ~20-40% of events due to:
 *   - iOS 14+ ATT (App Tracking Transparency) opt-outs
 *   - Adblockers / browser tracking protection
 *   - Network failures from third-party JS
 *
 * CAPI fixes this by sending events server→server directly to Meta. When paired
 * with client Pixel using same `event_id`, Meta deduplicates automatically.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

const CAPI_VERSION = 'v18.0';

export interface CapiEvent {
  event_name: 'Lead' | 'CompleteRegistration' | 'InitiateCheckout' | 'ViewContent' | 'PageView';
  event_time: number;
  event_id: string;
  event_source_url?: string;
  action_source: 'website';
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    ct?: string[];
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data?: Record<string, unknown>;
}

export interface CapiSendResult {
  ok: boolean;
  status: number;
  body?: unknown;
}

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export interface NormalizeInput {
  email?: string | null;
  whatsapp?: string | null;
  name?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export function buildUserData(input: NormalizeInput): CapiEvent['user_data'] {
  const ud: CapiEvent['user_data'] = {
    action_source: 'website',
  } as unknown as CapiEvent['user_data'];

  if (input.email) ud.em = [sha256(input.email)];
  if (input.whatsapp) {
    const e164 = normalizeWhatsappToE164(input.whatsapp).replace(/^\+/, '');
    ud.ph = [sha256(e164)];
  }
  if (input.name) {
    const parts = input.name.trim().split(/\s+/);
    if (parts[0]) ud.fn = [sha256(parts[0])];
    if (parts.length > 1) ud.ln = [sha256(parts[parts.length - 1] ?? '')];
  }
  if (input.ip && input.ip !== 'unknown') ud.client_ip_address = input.ip;
  if (input.userAgent) ud.client_user_agent = input.userAgent;
  return ud;
}

export interface CapiConfig {
  pixelId: string;
  accessToken: string;
  testEventCode?: string;
}

export function readCapiConfig(): CapiConfig | null {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || pixelId === '000000000000000' || !accessToken) {
    return null;
  }
  return {
    pixelId,
    accessToken,
    testEventCode: process.env.META_CAPI_TEST_EVENT_CODE,
  };
}

const TIMEOUT_MS = 5000;

export async function sendCapiEvent(
  config: CapiConfig,
  event: CapiEvent,
): Promise<CapiSendResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const body: Record<string, unknown> = {
    data: [event],
    access_token: config.accessToken,
  };
  if (config.testEventCode) {
    body.test_event_code = config.testEventCode;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${CAPI_VERSION}/${config.pixelId}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );
    const respBody = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, body: respBody };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { ok: false, status: 504, body: { error: 'capi_timeout' } };
    }
    return {
      ok: false,
      status: 503,
      body: { error: err instanceof Error ? err.message : 'capi_network_error' },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export const _internalsForTests = { sha256 };
