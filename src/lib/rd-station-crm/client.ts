/**
 * Cliente da API do RD Station CRM (criar negociação).
 *
 * Endpoint: POST https://crm.rdstation.com/api/v1/deals?token=XXX
 * Token via query string (formato legado do CRM, distinto do RD Marketing).
 *
 * Política:
 *   - Timeout 5s. Acima disso, marca falha como retryable=true.
 *   - 200 → sucesso (retorna deal_id).
 *   - 4xx → rejeitado por validação (não retry).
 *   - 5xx ou network → retryable (poderia ser enfileirado num job depois).
 * Callers NÃO devem propagar erros pra cima — captura de lead nunca pode
 * quebrar porque o RD CRM ficou fora.
 */

import type { RdCrmConfig } from './config';
import type { RdCrmDealPayload } from './mapper';

const TIMEOUT_MS = 5_000;

export interface CreateDealOk {
  ok: true;
  dealId: string;
  raw: unknown;
}

export interface CreateDealError {
  ok: false;
  retryable: boolean;
  status: number;
  errorMessage?: string;
  raw?: unknown;
}

export type CreateDealResult = CreateDealOk | CreateDealError;

export async function createDeal(
  cfg: RdCrmConfig,
  payload: RdCrmDealPayload,
): Promise<CreateDealResult> {
  const url = `${cfg.apiBaseUrl}/deals?token=${encodeURIComponent(cfg.token)}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(t);
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    return {
      ok: false,
      retryable: true,
      status: isAbort ? 504 : 503,
      errorMessage: isAbort
        ? 'rd_crm_timeout'
        : err instanceof Error
          ? err.message
          : 'rd_crm_network_error',
    };
  }
  clearTimeout(t);

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // resposta sem JSON parseável — ainda usa o status code abaixo
  }

  if (res.ok) {
    const data = body as { _id?: string; id?: string };
    const id = data?._id ?? data?.id;
    if (!id) {
      return {
        ok: false,
        retryable: false,
        status: res.status,
        errorMessage: 'rd_crm_response_missing_id',
        raw: body,
      };
    }
    return { ok: true, dealId: id, raw: body };
  }

  return {
    ok: false,
    retryable: res.status >= 500,
    status: res.status,
    errorMessage: extractErrorMessage(body),
    raw: body,
  };
}

function extractErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const b = body as Record<string, unknown>;
  if (typeof b.error === 'string') return b.error;
  if (typeof b.message === 'string') return b.message;
  if (b.errors && typeof b.errors === 'object') {
    return JSON.stringify(b.errors);
  }
  return undefined;
}
