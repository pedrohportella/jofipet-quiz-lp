'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const TIER_LABEL: Record<Tier, { label: string; cls: string }> = {
  quente: { label: '🔥 Quente', cls: 'bg-red-100 text-red-700' },
  morno: { label: '🌻 Morno', cls: 'bg-amber-100 text-amber-700' },
  frio: { label: '💙 Frio', cls: 'bg-blue-100 text-blue-700' },
};

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

  // Polling 4s na lista
  useEffect(() => {
    fetchConversations();
    const t = setInterval(fetchConversations, 4000);
    return () => clearInterval(t);
  }, [fetchConversations]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[340px_1fr]">
      <aside className="rounded-xl bg-white shadow-jofi-1">
        <div className="flex flex-col gap-3 border-b border-neutral-200 p-3">
          <input
            type="search"
            placeholder="Buscar nome, telefone, email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <div className="flex gap-2 text-xs font-semibold">
            {(['all', 'unread', 'open'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 transition ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'unread' ? 'Não lidas' : 'Abertas'}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
          {loading && <p className="p-4 text-sm text-neutral-500">Carregando…</p>}
          {error && (
            <p className="p-4 text-sm text-error">
              Erro: {error}. CRM configurado? Cheque SUPABASE_* no .env.
            </p>
          )}
          {!loading && conversations.length === 0 && (
            <p className="p-4 text-sm text-neutral-500">
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

      <section className="min-h-[calc(100vh-160px)] rounded-xl bg-white shadow-jofi-1">
        {selectedId ? (
          <ConversationDetail
            conversationId={selectedId}
            stages={stages}
            onMutated={fetchConversations}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-neutral-500">
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
      className={`w-full border-b border-neutral-200 px-3 py-3 text-left transition ${
        active ? 'bg-primary/5' : 'hover:bg-neutral-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="truncate text-sm font-semibold text-neutral-900">
          {conv.lead?.name ?? 'Sem nome'}
        </span>
        <span className="text-xs text-neutral-500">
          {formatTime(conv.last_message_at)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
        <span>{formatPhone(conv.lead?.whatsapp_e164 ?? '')}</span>
        {tier && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_LABEL[tier].cls}`}
          >
            {TIER_LABEL[tier].label}
          </span>
        )}
        {conv.unread_count > 0 && (
          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
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

  if (error) return <p className="p-6 text-error">Erro: {error}</p>;
  if (!data) return <p className="p-6 text-neutral-500">Carregando…</p>;

  const outsideWindow = isOutsideSessionWindow(
    data.conversation.customer_last_inbound_at,
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-neutral-900">
            {data.conversation.lead.name}
          </h2>
          <p className="text-xs text-neutral-500">
            {formatPhone(data.conversation.lead.whatsapp_e164)} ·{' '}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TIER_LABEL[data.conversation.lead.tier].cls}`}
            >
              {TIER_LABEL[data.conversation.lead.tier].label}
            </span>{' '}
            · score {data.conversation.lead.score}
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
      <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-2 text-xs text-neutral-600">
        Capturado em {formatTime(data.conversation.lead.captured_at)}
        {data.conversation.lead.utm_source && (
          <> · UTM: <strong>{data.conversation.lead.utm_source}</strong></>
        )}
        {data.conversation.lead.email && (
          <> · {data.conversation.lead.email}</>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-neutral-50 px-5 py-4">
        {data.messages.length === 0 ? (
          <p className="text-sm text-neutral-500">
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
  if (msg.msg_type === 'template') {
    const params = msg.template_params as Record<string, string> | null;
    label = `[Template: ${msg.template_name}]${params ? ' (' + Object.values(params).join(', ') + ')' : ''}`;
  } else if (msg.msg_type === 'image') {
    label = '🖼 Imagem';
  } else if (msg.msg_type === 'audio') {
    label = '🎙 Áudio';
  } else if (msg.msg_type === 'video') {
    label = '🎞 Vídeo';
  } else if (msg.msg_type === 'document') {
    label = '📎 Documento';
  } else if (msg.msg_type === 'sticker') {
    label = '✨ Figurinha';
  }

  return (
    <div className={`mb-2 flex ${isOut ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[72%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isOut
            ? msg.status === 'failed'
              ? 'bg-red-100 text-red-900'
              : 'bg-primary text-white'
            : 'bg-white text-neutral-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{label || '(vazio)'}</p>
        <div
          className={`mt-1 flex items-center gap-1 text-[10px] ${
            isOut
              ? msg.status === 'failed'
                ? 'text-red-700'
                : 'text-white/80'
              : 'text-neutral-500'
          }`}
        >
          <span>{formatTime(ts)}</span>
          {isOut && (
            <>
              {msg.status === 'sent' && <span>✓</span>}
              {msg.status === 'delivered' && <span>✓✓</span>}
              {msg.status === 'read' && <span className="text-cyan-200">✓✓</span>}
              {msg.status === 'failed' && (
                <span title={msg.error_details ?? ''}>⚠ falhou</span>
              )}
              {msg.is_automated && <span title="Automático">🤖</span>}
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
      className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold text-neutral-700"
    >
      <option value="">Sem stage</option>
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
    <div className="border-t border-neutral-200 bg-white px-4 py-3">
      {outsideWindow && (
        <div className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Janela 24h fechada. Pra essa conversa, só dá pra enviar **template
          aprovado** (HSM).
        </div>
      )}
      {sendError && (
        <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
          Erro ao enviar: {sendError}
        </div>
      )}

      <div className="flex gap-2">
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
            className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-neutral-100"
          />
          <button
            onClick={sendTextMessage}
            disabled={outsideWindow || sending || !text.trim()}
            className="self-end rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Enviar
          </button>
        </div>

        <div className="flex w-64 flex-col gap-2 border-l border-neutral-200 pl-3">
          <label className="text-xs font-semibold text-neutral-500" htmlFor="hsm-template-select">
            Template (HSM)
          </label>
          <select
            id="hsm-template-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs"
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
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-xs"
            />
          )}
          <button
            onClick={sendTemplateMessage}
            disabled={!selectedTpl || sending}
            className="rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Enviar template
          </button>
        </div>
      </div>
    </div>
  );
}
