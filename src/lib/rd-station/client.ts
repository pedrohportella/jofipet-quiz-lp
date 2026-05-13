const RD_BASE_URL = 'https://api.rd.services';
const TIMEOUT_MS = 5000;

export interface RdConversionPayload {
  event_type: 'CONVERSION';
  event_family: 'CDP';
  payload: {
    conversion_identifier: string;
    email: string;
    name?: string;
    mobile_phone?: string;
    tags?: string[];
    [customField: string]: unknown;
  };
}

export class RdStationError extends Error {
  status: number;
  correlationId: string;
  body?: unknown;

  constructor(message: string, opts: { status: number; correlationId: string; body?: unknown }) {
    super(message);
    this.name = 'RdStationError';
    this.status = opts.status;
    this.correlationId = opts.correlationId;
    this.body = opts.body;
  }
}

export async function postConversion(
  token: string,
  payload: RdConversionPayload,
  correlationId: string,
): Promise<{ ok: true; rdResponse: unknown } | { ok: false; status: number; body: unknown }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${RD_BASE_URL}/platform/conversions?api_key=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return { ok: false, status: response.status, body };
    }

    return { ok: true, rdResponse: body };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new RdStationError('RD Station timeout', {
        status: 504,
        correlationId,
      });
    }
    throw new RdStationError(
      err instanceof Error ? err.message : 'RD Station network error',
      { status: 503, correlationId },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
