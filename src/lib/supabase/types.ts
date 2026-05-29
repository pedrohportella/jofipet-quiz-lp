/**
 * Tipos do schema CRM.
 *
 * MANUAL por enquanto — quando o projeto Supabase existir, substituir por:
 *   `supabase gen types typescript --linked > src/lib/supabase/database.types.ts`
 * e re-exportar abaixo. Mantenho os tipos curados aqui pra desenvolvimento
 * funcionar antes do projeto remoto estar criado.
 */

import type { Tier } from '@/lib/quiz/types';
import type { LeadVariant, StoredLead } from '@/lib/leads/store';

export type RdStatus = StoredLead['rdStatus'];

export interface CrmUser {
  id: string;
  email: string;
  display_name: string | null;
  role: 'admin' | 'atendente';
  created_at: string;
  updated_at: string;
}

export interface CrmPipelineStage {
  id: string;
  name: string;
  order_index: number;
  color: string;
  is_terminal: boolean;
  is_default_entry: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmLeadRow {
  lead_id: string;
  correlation_id: string;
  captured_at: string;
  ip: string | null;
  tier: Tier;
  score: number;
  variant: LeadVariant;

  name: string;
  whatsapp_e164: string;
  email: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;

  payload: Record<string, unknown>;

  rd_status: RdStatus;
  rd_warning: string | null;

  created_at: string;
  updated_at: string;
}

export type ConversationStatus = 'open' | 'snoozed' | 'closed';

export interface CrmConversationRow {
  id: string;
  lead_id: string;
  whatsapp_e164: string;
  status: ConversationStatus;
  pipeline_stage_id: string | null;
  assigned_to: string | null;
  customer_last_inbound_at: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export type MessageDirection = 'inbound' | 'outbound';
export type MessageType =
  | 'text'
  | 'template'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'sticker'
  | 'location'
  | 'reaction'
  | 'system';
export type MessageStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'received';

export interface CrmMessageRow {
  id: string;
  conversation_id: string;
  wa_message_id: string | null;
  direction: MessageDirection;
  msg_type: MessageType;
  body: string | null;
  template_name: string | null;
  template_language: string | null;
  template_params: Record<string, unknown> | null;
  media_url: string | null;
  media_caption: string | null;
  media_mime_type: string | null;
  status: MessageStatus;
  error_code: number | null;
  error_title: string | null;
  error_details: string | null;
  sent_by: string | null;
  is_automated: boolean;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  received_at: string | null;
  raw: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAUSED'
  | 'DISABLED';

export interface CrmTemplateRow {
  id: string;
  meta_template_id: string | null;
  name: string;
  language: string;
  category: TemplateCategory;
  status: TemplateStatus;
  components: unknown;
  variables: unknown | null;
  rejection_reason: string | null;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmTagRow {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CrmNoteRow {
  id: string;
  lead_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface CrmAssignmentLogRow {
  id: number;
  conversation_id: string;
  changed_by: string | null;
  change_type: 'stage' | 'assignee' | 'status';
  from_value: string | null;
  to_value: string | null;
  created_at: string;
}
