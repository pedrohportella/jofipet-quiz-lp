'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ArrowRight, MailOpen } from 'lucide-react';
import { Notice, StageMark, TierChip } from '@/components/admin/crm-ui';
import type { Tier } from '@/lib/quiz/types';

interface LeadSummary {
  lead_id: string;
  name: string;
  whatsapp_e164: string;
  tier: Tier;
  score: number;
  captured_at: string;
  utm_source: string | null;
}

interface ConversationCard {
  id: string;
  status: 'open' | 'snoozed' | 'closed';
  pipeline_stage_id: string | null;
  last_message_at: string | null;
  unread_count: number;
  lead: LeadSummary | null;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order_index: number;
  is_terminal: boolean;
}

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

export function KanbanClient() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [conversations, setConversations] = useState<ConversationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [stagesRes, convRes] = await Promise.all([
        fetch('/api/admin/crm/pipeline-stages', { cache: 'no-store' }),
        fetch('/api/admin/crm/conversations?limit=200', { cache: 'no-store' }),
      ]);
      if (!stagesRes.ok || !convRes.ok)
        throw new Error(
          `HTTP ${stagesRes.status}/${convRes.status} — CRM configurado?`,
        );
      const stagesJson = await stagesRes.json();
      const convJson = await convRes.json();
      setStages(stagesJson.stages ?? []);
      setConversations(convJson.items ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 8000);
    return () => clearInterval(t);
  }, [fetchAll]);

  // Agrupa cards por stage
  const grouped = useMemo(() => {
    const map = new Map<string | null, ConversationCard[]>();
    map.set(null, []);
    for (const s of stages) map.set(s.id, []);
    for (const c of conversations) {
      const bucket = map.get(c.pipeline_stage_id) ?? map.get(null)!;
      bucket.push(c);
    }
    return map;
  }, [conversations, stages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragStart = (e: DragStartEvent) => {
    setDraggingId(String(e.active.id));
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setDraggingId(null);
    const convId = String(e.active.id);
    const targetStageId = e.over?.id ? String(e.over.id) : null;
    if (!e.over) return;
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    if (conv.pipeline_stage_id === targetStageId) return;

    // Otimista
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, pipeline_stage_id: targetStageId } : c,
      ),
    );
    try {
      const res = await fetch(`/api/admin/crm/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline_stage_id: targetStageId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      // Reverte
      fetchAll();
    }
  };

  const draggingCard = useMemo(
    () => conversations.find((c) => c.id === draggingId) ?? null,
    [conversations, draggingId],
  );

  if (loading) {
    return (
      <p className="rounded-xl border border-neutral-300 bg-white p-8 text-neutral-700">
        Carregando…
      </p>
    );
  }
  if (error) {
    return <Notice tone="warn">Erro: {error}</Notice>;
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex snap-x gap-3 overflow-x-auto pb-4">
        {stages.map((s, i) => (
          <KanbanColumn
            key={s.id}
            stage={s}
            position={i}
            cards={grouped.get(s.id) ?? []}
          />
        ))}
      </div>

      <DragOverlay>
        {draggingCard ? <KanbanCard conv={draggingCard} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  stage,
  cards,
  position,
}: {
  stage: Stage;
  cards: ConversationCard[];
  position: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[400px] w-72 shrink-0 snap-start flex-col rounded-xl border border-neutral-300 bg-white/60 p-3 transition ${
        isOver ? 'bg-primary-100 ring-2 ring-primary' : ''
      }`}
    >
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StageMark stage={stage} position={position} />
          <h3 className="text-sm font-extrabold text-neutral-900">{stage.name}</h3>
        </div>
        <span className="rounded-pill bg-primary-50 px-2 py-0.5 text-xs font-bold text-neutral-900">
          {cards.length}
        </span>
      </header>

      <div className="flex flex-col gap-2">
        {cards.map((c) => (
          <KanbanCard key={c.id} conv={c} />
        ))}
        {cards.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 p-3 text-center text-xs font-medium text-neutral-700">
            Vazio
          </p>
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  conv,
  isOverlay,
}: {
  conv: ConversationCard;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: conv.id,
  });
  const tier = conv.lead?.tier;
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-lg border border-neutral-300 bg-white p-3 transition ${
        isDragging && !isOverlay ? 'opacity-30' : ''
      } ${isOverlay ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="truncate text-sm font-bold text-neutral-900">
          {conv.lead?.name ?? 'Sem nome'}
        </span>
        {tier && <TierChip tier={tier} />}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-neutral-700">
        <span>{conv.lead?.utm_source ?? '(direto)'}</span>
        <span>{formatTime(conv.last_message_at)}</span>
      </div>
      {conv.unread_count > 0 && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-pill bg-primary-100 px-2 py-0.5 text-[11px] font-bold text-neutral-900">
          <MailOpen size={12} strokeWidth={2.25} aria-hidden="true" />
          {conv.unread_count} não lida{conv.unread_count > 1 ? 's' : ''}
        </div>
      )}
      <Link
        href={`/admin/crm/inbox?c=${conv.id}`}
        className="mt-1 flex min-h-[32px] items-center gap-1 text-xs font-bold text-primary-600 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        Abrir
        <ArrowRight size={14} strokeWidth={2.25} aria-hidden="true" />
      </Link>
    </div>
  );
}
