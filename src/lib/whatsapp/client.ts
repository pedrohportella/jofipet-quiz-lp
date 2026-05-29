/**
 * Cliente da Cloud API do WhatsApp (Meta).
 *
 * Envia mensagens via POST graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 *
 * Modos de envio:
 *   - sendText: fora da janela de 24h, só funciona se o cliente respondeu
 *     pelo menos uma vez (free-form session). Pra primeira mensagem, usar
 *     sendTemplate.
 *   - sendTemplate: HSM aprovado pela Meta. Único modo de iniciar conversa
 *     com lead que nunca respondeu.
 *
 * Política de erros:
 *   - 200/201 → success
 *   - 4xx (validação, template não aprovado, número inválido) → ApiError
 *   - 5xx ou rede → ApiError com retryable=true
 * O caller (ingest, webhook handler) decide o que fazer com retryable.
 */

import { buildGraphUrl, type WhatsAppConfig } from './config';

export interface SendResultOk {
  ok: true;
  waMessageId: string;
  contactWaId: string | null;
  raw: unknown;
}

export interface SendResultError {
  ok: false;
  retryable: boolean;
  status: number;
  errorCode?: number;
  errorTitle?: string;
  errorMessage?: string;
  raw?: unknown;
}

export type SendResult = SendResultOk | SendResultError;

const DEFAULT_TIMEOUT_MS = 8_000;

async function postWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

async function postMessage(
  cfg: WhatsAppConfig,
  body: Record<string, unknown>,
): Promise<SendResult> {
  const url = buildGraphUrl(cfg, `${cfg.phoneNumberId}/messages`);
  let res: Response;
  try {
    res = await postWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.accessToken}`,
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
      },
      DEFAULT_TIMEOUT_MS,
    );
  } catch (err) {
    return {
      ok: false,
      retryable: true,
      status: 0,
      errorTitle: 'network_or_timeout',
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }

  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    // Resposta sem JSON parsável — anota mas segue
  }

  if (res.ok) {
    const data = json as {
      messages?: Array<{ id: string }>;
      contacts?: Array<{ wa_id: string }>;
    };
    const id = data?.messages?.[0]?.id;
    if (!id) {
      return {
        ok: false,
        retryable: false,
        status: res.status,
        errorTitle: 'no_message_id_in_response',
        raw: json,
      };
    }
    return {
      ok: true,
      waMessageId: id,
      contactWaId: data?.contacts?.[0]?.wa_id ?? null,
      raw: json,
    };
  }

  const errBody = json as {
    error?: { code?: number; message?: string; error_subcode?: number; type?: string };
  };
  return {
    ok: false,
    retryable: res.status >= 500,
    status: res.status,
    errorCode: errBody?.error?.code,
    errorTitle: errBody?.error?.type,
    errorMessage: errBody?.error?.message,
    raw: json,
  };
}

export interface SendTextOpts {
  to: string;          // E.164 sem '+', ex '5511987654321'
  body: string;
  previewUrl?: boolean;
}

export function sendText(cfg: WhatsAppConfig, opts: SendTextOpts): Promise<SendResult> {
  return postMessage(cfg, {
    to: opts.to,
    type: 'text',
    text: { body: opts.body, preview_url: opts.previewUrl ?? false },
  });
}

export interface TemplateComponentParam {
  type: 'text';
  text: string;
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'quick_reply' | 'url';
  index?: string;
  parameters?: TemplateComponentParam[];
}

export interface SendTemplateOpts {
  to: string;
  templateName: string;
  language: string;             // ex 'pt_BR'
  components?: TemplateComponent[];
}

export function sendTemplate(
  cfg: WhatsAppConfig,
  opts: SendTemplateOpts,
): Promise<SendResult> {
  return postMessage(cfg, {
    to: opts.to,
    type: 'template',
    template: {
      name: opts.templateName,
      language: { code: opts.language },
      components: opts.components ?? [],
    },
  });
}

export interface SendMediaOpts {
  to: string;
  kind: 'image' | 'audio' | 'video' | 'document';
  link: string;
  caption?: string;
  filename?: string;
}

export function sendMedia(cfg: WhatsAppConfig, opts: SendMediaOpts): Promise<SendResult> {
  const media: Record<string, unknown> = { link: opts.link };
  if (opts.caption) media.caption = opts.caption;
  if (opts.filename && opts.kind === 'document') media.filename = opts.filename;
  return postMessage(cfg, {
    to: opts.to,
    type: opts.kind,
    [opts.kind]: media,
  });
}

/**
 * Marca uma mensagem inbound como lida.
 * Útil quando atendente abre a conversa na inbox — espelha "blue check"
 * pro cliente. Best-effort.
 */
export async function markAsRead(
  cfg: WhatsAppConfig,
  waMessageId: string,
): Promise<SendResult> {
  return postMessage(cfg, {
    status: 'read',
    message_id: waMessageId,
  });
}
