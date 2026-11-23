'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Check,
  CheckCheck,
  ChevronLeft,
  Clock,
  Film,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Search,
  Sparkles,
} from 'lucide-react';
import { Notice, TierChip } from '@/components/admin/crm-ui';
import type { Tier } from '@/lib/quiz/types';

// =============================================================================
// Tipos do payload das APIs
// =============================================================================
interface LeadSummary {
  lead_id: string;
  name: string;
  whatsapp_e164: string;
  email: string | null;
  tier: Tier;
  score: number;
  captured_at: string;
  utm_source: string | null;
}

interface ConversationListItem {
  id: string;
  status: 'open' | 'snoozed' | 'closed';
  pipeline_stage_id: string | null;
  assigned_to: string | null;
  last_message_at: string | null;
  unread_count: number;
  customer_last_inbound_at: string | null;
  lead: LeadSummary | null;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  wa_message_id: string | null;
  direction: 'inbound' | 'outbound';
  msg_type: string;
  body: string | null;
  template_name: string | null;
  template_params: Record<string, unknown> | null;
  media_url: string | null;
  status: string;
  error_code: number | null;
  error_details: string | null;
  is_automated: boolean;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  received_at: string | null;
  created_at: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order_index: number;
}

interface TemplateRow {
  id: string;
  name: string;
  language: string;
  status: string;
  components: unknown;
}

// =============================================================================
// Helpers
// =============================================================================
function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  return sameDay
    ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function isOutsideSessionWindow(lastInboundAt: string | null): boolean {
  if (!lastInboundAt) return true;
  const elapsed = Date.now() - new Date(lastInboundAt).getTime();
  return elapsed > 24 * 60 * 60 * 1000;
}

function formatPhone(e164: string): string {
  // 5511987654321 → +55 11 98765-4321
  if (!e164.startsWith('55')) return `+${e164}`;
  const rest = e164.slice(2);
  if (rest.length === 11) {
    return `+55 ${rest.slice(0, 2)} ${rest.slice(2, 7)}-${rest.slice(7)}`;
  }
  if (rest.length === 10) {
    return `+55 ${rest.slice(0, 2)} ${rest.slice(2, 6)}-${rest.slice(6)}`;
  }
  return `+55 ${rest}`;
}

// =============================================================================
// Componente raiz
// =============================================================================
export function InboxClient() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'open'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'open') params.set('status', 'open');
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/crm/conversations?${params}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      let items = (json.items ?? []) as ConversationListItem[];
      if (filter === 'unread') items = items.filter((i) => i.unread_count > 0);
      setConversations(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  const fetchStages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/crm/pipeline-stages', {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = await res.json();
      setStages(json.stages ?? []);
    } catch {
      // silencia — stages é opcional pra exibir badge
    }
  }, []);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  // "Abrir" do Kanban chega com ?c=<id da conversa>
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('c');
    if (c) setSelectedId(c);
  }, []);

  // Polling 4s na lista
  useEffect(() => {
    fetchConversations();
    const t = setInterval(fetchConversations, 4000);
    return () => clearInterval(t);
  }, [fetchConversations]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[340px_1fr]">
      <aside
        className={`overflow-hidden rounded-xl border border-neutral-300 bg-white ${
          selectedId ? 'hidden md:block' : ''
        }`}
      >
        <div className="flex flex-col gap-3 border-b border-neutral-300 p-3">
          <div className="relative">
            <Search
              size={16}
              strokeWidth={2.25}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-700"
            />
            <input
              type="search"
              placeholder="Buscar nome, telefone, email"
              aria-label="Buscar conversa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-[44px] w-full rounded-pill border border-neutral-300 bg-white pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2 text-xs font-bold">
            {(['all', 'unread', 'open'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`min-h-[36px] rounded-pill px-4 transition ${
                  filter === f
                    ? 'bg-neutral-900 text-white'
                    : 'bg-primary-50 text-neutral-900 hover:bg-primary-100'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'unread' ? 'Não lidas' : 'Abertas'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto md:max-h-[calc(100vh-290px)]">
          {loading && <p className="p-4 text-sm text-neutral-700">Carregando…</p>}
          {error && (
            <div className="p-3">
              <Notice tone="warn">
                Erro: {error}. CRM configurado? Cheque SUPABASE_* no .env.
              </Notice>
            </div>
          )}
          {!loading && conversations.length === 0 && (
            <p className="p-4 text-sm text-neutral-700">
              Nenhuma conversa ainda. Quando um lead for capturado pelo quiz,
              ele aparece aqui.
            </p>
          )}
          {conversations.map((c) => (
            <ConversationListRow
              key={c.id}
              conv={c}
              active={c.id === selectedId}
              onSelect={() => setSelectedId(c.id)}
            />
          ))}
        </div>
      </aside>

      <section
        className={`overflow-hidden rounded-xl border border-neutral-300 bg-white md:min-h-[calc(100vh-230px)] ${
          selectedId ? '' : 'hidden md:block'
        }`}
      >
        {selectedId ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="flex min-h-[44px] w-full items-center gap-1 border-b border-neutral-300 px-3 text-sm font-bold text-primary-600 md:hidden"
            >
              <ChevronLeft size={18} strokeWidth={2.25} aria-hidden="true" />
              Conversas
            </button>
            <ConversationDetail
              conversationId={selectedId}
              stages={stages}
              onMutated={fetchConversations}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-neutral-700">
            Selecione uma conversa à esquerda
          </div>
        )}
      </section>
    </div>
  );
}

// =============================================================================
// Linha da lista
// =============================================================================
function ConversationListRow({
  conv,
  active,
  onSelect,
}: {
  conv: ConversationListItem;
  active: boolean;
  onSelect: () => void;
}) {
  const tier = conv.lead?.tier;
  return (
    <button
      onClick={onSelect}
      className={`w-full border-b border-l-4 border-b-neutral-300 px-3 py-3 text-left transition ${
        active ? 'border-l-primary bg-primary-50' : 'border-l-transparent hover:bg-primary-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="truncate text-sm font-bold text-neutral-900">
          {conv.lead?.name ?? 'Sem nome'}
        </span>
        <span className="text-xs text-neutral-700">
          {formatTime(conv.last_message_at)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-700">
        <span>{formatPhone(conv.lead?.whatsapp_e164 ?? '')}</span>
        {tier && <TierChip tier={tier} />}
        {conv.unread_count > 0 && (
          <span
            className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-pill bg-neutral-900 px-1.5 py-0.5 text-[11px] font-bold text-white"
            aria-label={`${conv.unread_count} não lidas`}
          >
            {conv.unread_count}
          </span>
        )}
      </div>
    </button>
  );
}

// =============================================================================
// Detalhe da conversa + chat
// =============================================================================
function ConversationDetail({
  conversationId,
  stages,
  onMutated,
}: {
  conversationId: string;
  stages: PipelineStage[];
  onMutated: () => void;
}) {
  interface DetailData {
    conversation: ConversationListItem & {
      lead: LeadSummary;
      created_at: string;
    };
    messages: MessageRow[];
  }
  const [data, setData] = useState<DetailData | null>(null);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/crm/conversations/${conversationId}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = (await res.json()) as DetailData;
      setData(j);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
    }
  }, [conversationId]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/crm/templates?status=APPROVED', {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const j = await res.json();
      setTemplates(j.templates ?? []);
    } catch {
      // silencia
    }
  }, []);

  useEffect(() => {
    fetchDetail();
    fetchTemplates();
    // Marca como lida ao abrir
    fetch(`/api/admin/crm/conversations/${conversationId}/read`, {
      method: 'POST',
    }).then(() => onMutated());
    const t = setInterval(fetchDetail, 2500);
    return () => clearInterval(t);
  }, [conversationId, fetchDetail, fetchTemplates, onMutated]);

  // Auto-scroll quando novas mensagens chegam
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [data?.messages.length]);

  if (error)
    return (
      <div className="p-4">
        <Notice tone="warn">Erro: {error}</Notice>
      </div>
    );
  if (!data) return <p className="p-6 text-neutral-700">Carregando…</p>;

  const outsideWindow = isOutsideSessionWindow(
    data.conversation.customer_last_inbound_at,
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-300 px-4 py-3 md:px-5 md:py-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900">
            {data.conversation.lead.name}
          </h2>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-700">
            <span>{formatPhone(data.conversation.lead.whatsapp_e164)}</span>
            <TierChip tier={data.conversation.lead.tier} />
            <span>score {data.conversation.lead.score}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StageSelector
            conversationId={conversationId}
            current={data.conversation.pipeline_stage_id}
            stages={stages}
            onChanged={() => {
              fetchDetail();
              onMutated();
            }}
          />
        </div>
      </header>

      {/* Lead context bar */}
      <div className="border-b border-neutral-300 bg-primary-50 px-4 py-2 text-xs text-neutral-900 md:px-5">
        Capturado em {formatTime(data.conversation.lead.captured_at)}
        {data.conversation.lead.utm_source && (
          <> · UTM: <strong>{data.conversation.lead.utm_source}</strong></>
        )}
        {data.conversation.lead.email && (
          <> · {data.conversation.lead.email}</>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="max-h-[60vh] min-h-[240px] flex-1 overflow-y-auto bg-primary-50 px-4 py-4 md:max-h-[calc(100vh-520px)] md:px-5"
      >
        {data.messages.length === 0 ? (
          <p className="text-sm text-neutral-700">
            Nenhuma mensagem ainda. Use o template abaixo pra iniciar.
          </p>
        ) : (
          data.messages.map((m) => <MessageBubble key={m.id} msg={m} />)
        )}
      </div>

      {/* Compose */}
      <ComposeBox
        conversationId={conversationId}
        outsideWindow={outsideWindow}
        templates={templates}
        onSent={() => {
          fetchDetail();
          onMutated();
        }}
      />
    </div>
  );
}

function MessageBubble({ msg }: { msg: MessageRow }) {
  const isOut = msg.direction === 'outbound';
  const ts = msg.sent_at ?? msg.received_at ?? msg.created_at;
  let label = msg.body ?? '';
  let MediaIcon: typeof ImageIcon | null = null;
  if (msg.msg_type === 'template') {
    const params = msg.template_params as Record<string, string> | null;
    label = `[Template: ${msg.template_name}]${params ? ' (' + Object.values(params).join(', ') + ')' : ''}`;
  } else if (msg.msg_type === 'image') {
    label = 'Imagem';
    MediaIcon = ImageIcon;
  } else if (msg.msg_type === 'audio') {
    label = 'Áudio';
    MediaIcon = Mic;
  } else if (msg.msg_type === 'video') {
    label = 'Vídeo';
    MediaIcon = Film;
  } else if (msg.msg_type === 'document') {
    label = 'Documento';
    MediaIcon = Paperclip;
  } else if (msg.msg_type === 'sticker') {
    label = 'Figurinha';
    MediaIcon = Sparkles;
  }
  const failed = isOut && msg.status === 'failed';

  // Enviada: azul-tinta com texto branco (8,8:1). Recebida: branco com contorno. Falha: realce-suave com ícone.
  return (
    <div className={`mb-2 flex ${isOut ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm md:max-w-[72%] ${
          isOut
            ? failed
              ? 'border border-accent-600 bg-accent-100 text-neutral-900'
              : 'bg-neutral-900 text-white'
            : 'border border-neutral-300 bg-white text-neutral-900'
        }`}
      >
        <p className="flex items-start gap-1.5 whitespace-pre-wrap">
          {MediaIcon && <MediaIcon size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0" />}
          <span>{label || '(vazio)'}</span>
        </p>
        <div
          className={`mt-1 flex items-center gap-1 text-[11px] ${
            isOut ? (failed ? 'text-neutral-900' : 'text-primary-100') : 'text-neutral-700'
          }`}
        >
          <span>{formatTime(ts)}</span>
          {isOut && (
            <>
              {msg.status === 'sent' && <Check size={14} strokeWidth={2.25} aria-label="Enviada" />}
              {msg.status === 'delivered' && (
                <CheckCheck size={14} strokeWidth={2.25} aria-label="Entregue" />
              )}
              {msg.status === 'read' && (
                <CheckCheck size={14} strokeWidth={2.25} aria-label="Lida" className="text-primary-300" />
              )}
              {failed && (
                <span title={msg.error_details ?? ''} className="inline-flex items-center gap-1 font-bold">
                  <AlertTriangle size={14} strokeWidth={2.25} aria-hidden="true" />
                  Falhou
                </span>
              )}
              {msg.is_automated && <Bot size={14} strokeWidth={2} aria-label="Automática" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StageSelector({
  conversationId,
  current,
  stages,
  onChanged,
}: {
  conversationId: string;
  current: string | null;
  stages: PipelineStage[];
  onChanged: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const onChange = async (newId: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/admin/crm/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_stage_id: newId || null }),
      });
      onChanged();
    } finally {
      setUpdating(false);
    }
  };
  return (
    <select
      value={current ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={updating}
      aria-label="Etapa do funil"
      className="min-h-[36px] rounded-pill border border-neutral-300 bg-white px-3 text-xs font-bold text-neutral-900"
    >
      <option value="">Sem etapa</option>
      {stages.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

function ComposeBox({
  conversationId,
  outsideWindow,
  templates,
  onSent,
}: {
  conversationId: string;
  outsideWindow: boolean;
  templates: TemplateRow[];
  onSent: () => void;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateParams, setTemplateParams] = useState('');

  const selectedTpl = useMemo(
    () => templates.find((t) => t.name === selectedTemplate),
    [templates, selectedTemplate],
  );

  const sendTextMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(
        `/api/admin/crm/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'text', body: text.trim() }),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setSendError(j.message ?? `HTTP ${res.status}`);
        return;
      }
      setText('');
      onSent();
    } finally {
      setSending(false);
    }
  };

  const sendTemplateMessage = async () => {
    if (!selectedTpl) return;
    setSending(true);
    setSendError(null);
    const params = templateParams
      ? templateParams.split('|').map((s) => s.trim())
      : [];
    try {
      const res = await fetch(
        `/api/admin/crm/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'template',
            name: selectedTpl.name,
            language: selectedTpl.language,
            params,
          }),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setSendError(j.message ?? `HTTP ${res.status}`);
        return;
      }
      setSelectedTemplate('');
      setTemplateParams('');
      onSent();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-neutral-300 bg-white px-4 py-3">
      {outsideWindow && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-accent-100 px-3 py-2 text-xs font-semibold text-neutral-900">
          <Clock size={14} strokeWidth={2.25} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>
            Janela de 24h fechada. Nesta conversa só dá para enviar{' '}
            <strong>template aprovado</strong> (HSM).
          </span>
        </div>
      )}
      {sendError && (
        <div className="mb-2">
          <Notice tone="warn">Erro ao enviar: {sendError}</Notice>
        </div>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={outsideWindow || sending}
            placeholder={
              outsideWindow
                ? 'Use um template aprovado →'
                : 'Escreva uma mensagem…'
            }
            rows={2}
            className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-primary-50"
          />
          <button
            onClick={sendTextMessage}
            disabled={outsideWindow || sending || !text.trim()}
            className="min-h-[44px] self-end rounded-pill bg-accent px-6 text-base font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-accent-300 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>

        <div className="flex w-full flex-col gap-2 border-t border-neutral-300 pt-3 md:w-64 md:border-l md:border-t-0 md:pl-3 md:pt-0">
          <label className="text-xs font-bold text-neutral-700" htmlFor="hsm-template-select">
            Template (HSM)
          </label>
          <select
            id="hsm-template-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="min-h-[40px] rounded-lg border border-neutral-300 bg-white px-2 text-xs text-neutral-900"
          >
            <option value="">— escolha —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          {selectedTpl && (
            <input
              value={templateParams}
              onChange={(e) => setTemplateParams(e.target.value)}
              placeholder="Param1 | Param2 | ..."
              className="min-h-[40px] rounded-lg border border-neutral-300 px-2 text-xs text-neutral-900 placeholder:text-neutral-500"
            />
          )}
          <button
            onClick={sendTemplateMessage}
            disabled={!selectedTpl || sending}
            className="min-h-[40px] rounded-pill border-2 border-neutral-900 bg-white px-4 text-xs font-extrabold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-primary-50 disabled:opacity-50"
          >
            Enviar template
          </button>
        </div>
      </div>
    </div>
  );
}
