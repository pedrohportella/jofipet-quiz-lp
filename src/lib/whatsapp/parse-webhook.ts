/**
 * Parser do payload de webhook do WhatsApp Cloud API.
 *
 * Spec: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
 *
 * O webhook agrega N entries (objetos WABA) com N changes. Cada change
 * traz EITHER:
 *   - messages[]  → mensagens recebidas do cliente
 *   - statuses[]  → eventos de ciclo de vida das mensagens enviadas
 *     (sent, delivered, read, failed)
 *   - contacts[]  → perfil do remetente (nome, wa_id)
 *
 * Esse módulo achata isso em estruturas planas que o handler de webhook
 * usa pra escrever no Postgres.
 */

export interface IncomingMessage {
  waMessageId: string;
  from: string;                // E.164 sem '+' (wa_id)
  timestamp: number;           // unix seconds (vem como string da Meta)
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location' | 'reaction' | 'unsupported' | 'button' | 'interactive';
  body?: string;
  mediaId?: string;
  mediaMimeType?: string;
  caption?: string;
  context?: {
    repliedWaMessageId?: string;
    forwarded?: boolean;
  };
  raw: unknown;
}

export interface ContactProfile {
  waId: string;
  name: string | null;
}

export type StatusEvent = {
  waMessageId: string;
  recipient: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  errorCode?: number;
  errorTitle?: string;
  errorMessage?: string;
  raw: unknown;
};

export interface TemplateStatusEvent {
  metaTemplateId: string;
  templateName: string;
  language: string;
  newStatus: 'APPROVED' | 'REJECTED' | 'PENDING' | 'PAUSED' | 'DISABLED';
  reason?: string;
}

export interface ParsedWebhook {
  messages: IncomingMessage[];
  statuses: StatusEvent[];
  contacts: ContactProfile[];
  templateStatusUpdates: TemplateStatusEvent[];
  phoneNumberId: string | null;
  wabaId: string | null;
}

interface MetaPayload {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: { display_phone_number?: string; phone_number_id?: string };
        contacts?: Array<{ wa_id: string; profile?: { name?: string } }>;
        messages?: Array<RawMessage>;
        statuses?: Array<RawStatus>;
        message_template_id?: string;
        message_template_name?: string;
        message_template_language?: string;
        event?: string;
        reason?: string;
      };
    }>;
  }>;
}

interface RawMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type?: string; caption?: string };
  audio?: { id: string; mime_type?: string };
  video?: { id: string; mime_type?: string; caption?: string };
  document?: { id: string; mime_type?: string; caption?: string; filename?: string };
  sticker?: { id: string; mime_type?: string };
  reaction?: { message_id: string; emoji?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  button?: { text: string; payload?: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  context?: { from?: string; id?: string; forwarded?: boolean };
}

interface RawStatus {
  id: string;
  recipient_id: string;
  status: string;
  timestamp: string;
  errors?: Array<{
    code: number;
    title?: string;
    message?: string;
    error_data?: { details?: string };
  }>;
}

function asInt(s: string | undefined): number {
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function extractIncoming(raw: RawMessage): IncomingMessage {
  const base: IncomingMessage = {
    waMessageId: raw.id,
    from: raw.from,
    timestamp: asInt(raw.timestamp),
    type: 'unsupported',
    raw,
  };

  if (raw.context) {
    base.context = {
      repliedWaMessageId: raw.context.id,
      forwarded: raw.context.forwarded,
    };
  }

  switch (raw.type) {
    case 'text':
      base.type = 'text';
      base.body = raw.text?.body;
      break;
    case 'image':
      base.type = 'image';
      base.mediaId = raw.image?.id;
      base.mediaMimeType = raw.image?.mime_type;
      base.caption = raw.image?.caption;
      break;
    case 'audio':
      base.type = 'audio';
      base.mediaId = raw.audio?.id;
      base.mediaMimeType = raw.audio?.mime_type;
      break;
    case 'video':
      base.type = 'video';
      base.mediaId = raw.video?.id;
      base.mediaMimeType = raw.video?.mime_type;
      base.caption = raw.video?.caption;
      break;
    case 'document':
      base.type = 'document';
      base.mediaId = raw.document?.id;
      base.mediaMimeType = raw.document?.mime_type;
      base.caption = raw.document?.caption;
      break;
    case 'sticker':
      base.type = 'sticker';
      base.mediaId = raw.sticker?.id;
      base.mediaMimeType = raw.sticker?.mime_type;
      break;
    case 'reaction':
      base.type = 'reaction';
      base.body = raw.reaction?.emoji;
      base.context = {
        ...(base.context ?? {}),
        repliedWaMessageId: raw.reaction?.message_id,
      };
      break;
    case 'location':
      base.type = 'location';
      base.body = `${raw.location?.latitude},${raw.location?.longitude}${
        raw.location?.name ? ` (${raw.location.name})` : ''
      }`;
      break;
    case 'button':
      base.type = 'button';
      base.body = raw.button?.text;
      break;
    case 'interactive':
      base.type = 'interactive';
      base.body =
        raw.interactive?.button_reply?.title ??
        raw.interactive?.list_reply?.title;
      break;
    default:
      base.type = 'unsupported';
  }

  return base;
}

function extractStatus(raw: RawStatus): StatusEvent {
  const err = raw.errors?.[0];
  return {
    waMessageId: raw.id,
    recipient: raw.recipient_id,
    timestamp: asInt(raw.timestamp),
    status: (raw.status as StatusEvent['status']) ?? 'sent',
    errorCode: err?.code,
    errorTitle: err?.title,
    errorMessage: err?.message ?? err?.error_data?.details,
    raw,
  };
}

export function parseWebhook(payload: unknown): ParsedWebhook {
  const out: ParsedWebhook = {
    messages: [],
    statuses: [],
    contacts: [],
    templateStatusUpdates: [],
    phoneNumberId: null,
    wabaId: null,
  };

  const meta = payload as MetaPayload;
  if (!meta || typeof meta !== 'object') return out;
  const entries = meta.entry ?? [];

  for (const entry of entries) {
    if (entry.id) out.wabaId = entry.id;
    for (const change of entry.changes ?? []) {
      const v = change.value ?? {};
      if (v.metadata?.phone_number_id) {
        out.phoneNumberId = v.metadata.phone_number_id;
      }

      // Contacts
      for (const c of v.contacts ?? []) {
        out.contacts.push({
          waId: c.wa_id,
          name: c.profile?.name ?? null,
        });
      }

      // Incoming messages
      for (const m of v.messages ?? []) {
        out.messages.push(extractIncoming(m));
      }

      // Outbound status updates
      for (const s of v.statuses ?? []) {
        out.statuses.push(extractStatus(s));
      }

      // Template status update field
      if (change.field === 'message_template_status_update' && v.message_template_id) {
        out.templateStatusUpdates.push({
          metaTemplateId: v.message_template_id,
          templateName: v.message_template_name ?? '',
          language: v.message_template_language ?? '',
          newStatus: (v.event as TemplateStatusEvent['newStatus']) ?? 'PENDING',
          reason: v.reason,
        });
      }
    }
  }

  return out;
}
