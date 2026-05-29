-- Jofi CRM — Schema inicial
-- Epic 5: CRM com WhatsApp Cloud API + coexistência
--
-- Convenções:
--   - Todas as tabelas têm prefixo crm_ pra namespace claro (futuro multi-tenant)
--   - PKs em UUID (gen_random_uuid) exceto crm_leads.lead_id que vem do KV existente
--   - timestamps timestamptz, sempre default now()
--   - RLS ON em tudo. Policies no final do arquivo.

-- ===========================================================================
-- Extensions
-- ===========================================================================
create extension if not exists "pgcrypto";

-- ===========================================================================
-- Helper: trigger pra atualizar updated_at automaticamente
-- ===========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===========================================================================
-- crm_users — atendentes
-- ===========================================================================
-- Linka 1:1 com auth.users (Supabase Auth). Antes da migração de auth,
-- nada se conecta aqui; depois da migração, cada login cria/atualiza row.
create table public.crm_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'atendente' check (role in ('admin', 'atendente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger crm_users_updated_at
  before update on public.crm_users
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- crm_pipeline_stages — etapas do funil (editáveis)
-- ===========================================================================
create table public.crm_pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  order_index int not null,
  color text not null default '#94a3b8',
  is_terminal boolean not null default false,
  is_default_entry boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index crm_pipeline_stages_order_idx on public.crm_pipeline_stages(order_index);
create unique index crm_pipeline_stages_default_entry_uniq
  on public.crm_pipeline_stages(is_default_entry)
  where is_default_entry = true;

create trigger crm_pipeline_stages_updated_at
  before update on public.crm_pipeline_stages
  for each row execute function public.set_updated_at();

-- Seed default pipeline
insert into public.crm_pipeline_stages (name, order_index, color, is_terminal, is_default_entry) values
  ('Novo',          10, '#3b82f6', false, true),
  ('Em contato',    20, '#8b5cf6', false, false),
  ('Qualificado',   30, '#f59e0b', false, false),
  ('Proposta',      40, '#06b6d4', false, false),
  ('Ganho',         50, '#22c55e', true,  false),
  ('Perdido',       60, '#ef4444', true,  false);

-- ===========================================================================
-- crm_leads — espelho persistente do StoredLead (KV)
-- ===========================================================================
-- PK = lead_id do KV (string tipo 'lead_xxx'). Mantemos como text pra
-- preservar correlação direta com /admin/leads existente.
create table public.crm_leads (
  lead_id text primary key,
  correlation_id text not null,
  captured_at timestamptz not null,
  ip text,
  tier text not null check (tier in ('quente', 'morno', 'frio')),
  score numeric(4,2) not null default 0,
  variant text not null default 'quiz' check (variant in ('quiz', 'oferta_lp')),

  name text not null,
  whatsapp_e164 text not null,
  email text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,

  -- snapshot completo do payload e respostas do quiz
  payload jsonb not null,

  rd_status text not null default 'unreachable'
    check (rd_status in ('sent', 'queued', 'rejected', 'unreachable', 'token_missing')),
  rd_warning text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_leads_whatsapp_idx on public.crm_leads(whatsapp_e164);
create index crm_leads_captured_at_idx on public.crm_leads(captured_at desc);
create index crm_leads_tier_idx on public.crm_leads(tier);
create index crm_leads_utm_source_idx on public.crm_leads(utm_source);

create trigger crm_leads_updated_at
  before update on public.crm_leads
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- crm_conversations — 1 conversa contínua por lead
-- ===========================================================================
-- Identidade da conversa = (whatsapp_e164). Lead pode mudar (multiplas
-- capturas do mesmo número), conversa não duplica.
create table public.crm_conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null references public.crm_leads(lead_id) on delete cascade,
  whatsapp_e164 text not null,

  status text not null default 'open' check (status in ('open', 'snoozed', 'closed')),
  pipeline_stage_id uuid references public.crm_pipeline_stages(id) on delete set null,
  assigned_to uuid references public.crm_users(id) on delete set null,

  -- janela de 24h da Meta — depois disso só HSM funciona
  customer_last_inbound_at timestamptz,
  last_message_at timestamptz,
  unread_count int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index crm_conversations_whatsapp_uniq on public.crm_conversations(whatsapp_e164);
create index crm_conversations_lead_idx on public.crm_conversations(lead_id);
create index crm_conversations_stage_idx on public.crm_conversations(pipeline_stage_id);
create index crm_conversations_last_message_idx on public.crm_conversations(last_message_at desc nulls last);
create index crm_conversations_assigned_idx on public.crm_conversations(assigned_to);

create trigger crm_conversations_updated_at
  before update on public.crm_conversations
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- crm_messages — mensagens WhatsApp (in + out)
-- ===========================================================================
create table public.crm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.crm_conversations(id) on delete cascade,

  -- ID da Meta (wamid.xxx). Pode ser null pra outbound antes do ack.
  wa_message_id text unique,

  direction text not null check (direction in ('inbound', 'outbound')),
  -- text, template, image, audio, video, document, sticker, location, reaction, system
  msg_type text not null,

  -- Conteúdo (mutuamente exclusivo conforme msg_type)
  body text,
  template_name text,
  template_language text,
  template_params jsonb,
  media_url text,
  media_caption text,
  media_mime_type text,

  -- Status do ciclo de vida (outbound) ou recebido (inbound)
  status text not null default 'received'
    check (status in ('queued', 'sent', 'delivered', 'read', 'failed', 'received')),
  error_code int,
  error_title text,
  error_details text,

  -- Quem disparou (outbound humano vs automático vs inbound)
  sent_by uuid references public.crm_users(id) on delete set null,
  is_automated boolean not null default false,

  -- timestamps específicos do ciclo
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  received_at timestamptz,

  -- raw payload original da Meta — útil pra debug e replay
  raw jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_messages_conversation_idx
  on public.crm_messages(conversation_id, coalesce(sent_at, received_at) desc);
create index crm_messages_direction_idx on public.crm_messages(direction);
create index crm_messages_status_idx on public.crm_messages(status);
create index crm_messages_wa_id_idx on public.crm_messages(wa_message_id) where wa_message_id is not null;

create trigger crm_messages_updated_at
  before update on public.crm_messages
  for each row execute function public.set_updated_at();

-- Trigger: ao inserir mensagem, atualizar last_message_at na conversa.
-- Pra inbound, incrementa unread_count e atualiza customer_last_inbound_at.
create or replace function public.crm_messages_touch_conversation()
returns trigger
language plpgsql
as $$
declare
  ts timestamptz := coalesce(new.sent_at, new.received_at, now());
begin
  update public.crm_conversations
  set last_message_at = ts,
      customer_last_inbound_at = case
        when new.direction = 'inbound' then ts
        else customer_last_inbound_at
      end,
      unread_count = case
        when new.direction = 'inbound' then unread_count + 1
        else unread_count
      end
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger crm_messages_after_insert
  after insert on public.crm_messages
  for each row execute function public.crm_messages_touch_conversation();

-- ===========================================================================
-- crm_templates — cache local dos HSM templates Meta
-- ===========================================================================
create table public.crm_templates (
  id uuid primary key default gen_random_uuid(),
  meta_template_id text unique,
  name text not null,
  language text not null default 'pt_BR',
  category text not null check (category in ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED')),
  components jsonb not null,   -- header/body/footer/buttons no formato Meta
  variables jsonb,             -- ex: [{"position":1,"label":"primeiro_nome"}]
  rejection_reason text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index crm_templates_name_lang_uniq on public.crm_templates(name, language);
create index crm_templates_status_idx on public.crm_templates(status);

create trigger crm_templates_updated_at
  before update on public.crm_templates
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- crm_tags + crm_lead_tags
-- ===========================================================================
create table public.crm_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#94a3b8',
  created_at timestamptz not null default now()
);

create table public.crm_lead_tags (
  lead_id text not null references public.crm_leads(lead_id) on delete cascade,
  tag_id uuid not null references public.crm_tags(id) on delete cascade,
  applied_by uuid references public.crm_users(id) on delete set null,
  applied_at timestamptz not null default now(),
  primary key (lead_id, tag_id)
);

create index crm_lead_tags_tag_idx on public.crm_lead_tags(tag_id);

-- ===========================================================================
-- crm_notes — comentários internos por lead
-- ===========================================================================
create table public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null references public.crm_leads(lead_id) on delete cascade,
  author_id uuid references public.crm_users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_notes_lead_idx on public.crm_notes(lead_id, created_at desc);

create trigger crm_notes_updated_at
  before update on public.crm_notes
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- crm_assignments_log — audit trail de stage/assigned changes
-- ===========================================================================
create table public.crm_assignments_log (
  id bigserial primary key,
  conversation_id uuid not null references public.crm_conversations(id) on delete cascade,
  changed_by uuid references public.crm_users(id) on delete set null,
  change_type text not null check (change_type in ('stage', 'assignee', 'status')),
  from_value text,
  to_value text,
  created_at timestamptz not null default now()
);

create index crm_assignments_log_conv_idx on public.crm_assignments_log(conversation_id, created_at desc);

-- ===========================================================================
-- Row-Level Security
-- ===========================================================================
alter table public.crm_users              enable row level security;
alter table public.crm_pipeline_stages    enable row level security;
alter table public.crm_leads              enable row level security;
alter table public.crm_conversations      enable row level security;
alter table public.crm_messages           enable row level security;
alter table public.crm_templates          enable row level security;
alter table public.crm_tags               enable row level security;
alter table public.crm_lead_tags          enable row level security;
alter table public.crm_notes              enable row level security;
alter table public.crm_assignments_log    enable row level security;

-- service_role bypassa RLS automaticamente. Policies abaixo cobrem 'authenticated'.
-- Modelo de permissão V1: authenticated lê tudo, escreve tudo. Sem segregação
-- de role/atribuição no MVP (Pedro é único atendente). Quando multi-user real
-- entrar, restringir crm_users/role + ownership checks.

create policy crm_authenticated_read_users
  on public.crm_users for select to authenticated using (true);
create policy crm_authenticated_self_upsert_users
  on public.crm_users for insert to authenticated with check (auth.uid() = id);
create policy crm_authenticated_self_update_users
  on public.crm_users for update to authenticated using (auth.uid() = id);

create policy crm_authenticated_all_pipeline_stages
  on public.crm_pipeline_stages for all to authenticated using (true) with check (true);

create policy crm_authenticated_all_leads
  on public.crm_leads for all to authenticated using (true) with check (true);

create policy crm_authenticated_all_conversations
  on public.crm_conversations for all to authenticated using (true) with check (true);

create policy crm_authenticated_all_messages
  on public.crm_messages for all to authenticated using (true) with check (true);

create policy crm_authenticated_all_templates
  on public.crm_templates for all to authenticated using (true) with check (true);

create policy crm_authenticated_all_tags
  on public.crm_tags for all to authenticated using (true) with check (true);

create policy crm_authenticated_all_lead_tags
  on public.crm_lead_tags for all to authenticated using (true) with check (true);

create policy crm_authenticated_all_notes
  on public.crm_notes for all to authenticated using (true) with check (true);

create policy crm_authenticated_read_assignments_log
  on public.crm_assignments_log for select to authenticated using (true);
create policy crm_authenticated_insert_assignments_log
  on public.crm_assignments_log for insert to authenticated with check (true);

-- ===========================================================================
-- Realtime publication — habilita subscription pra UI inbox/kanban
-- ===========================================================================
-- Supabase já tem publication 'supabase_realtime'. Adicionar nossas tabelas.
alter publication supabase_realtime add table public.crm_messages;
alter publication supabase_realtime add table public.crm_conversations;
alter publication supabase_realtime add table public.crm_assignments_log;
