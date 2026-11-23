import { AlertCircle, CheckCircle2, Flame, Snowflake, Sun, XCircle } from 'lucide-react';
import type { Tier } from '@/lib/quiz/types';

/**
 * Peças compartilhadas do CRM (Inbox e Kanban) no design system da Jofi.
 * Cor só como marca de estado; o texto sempre diz o estado, para não depender da cor.
 */

const TIER: Record<Tier, { label: string; Icon: typeof Flame; chip: string; icon: string }> = {
  // quente = laranja (realce-suave), morno = azul, frio = azul claro (borda-suave)
  quente: { label: 'Quente', Icon: Flame, chip: 'bg-accent-100', icon: 'text-accent-600' },
  morno: { label: 'Morno', Icon: Sun, chip: 'bg-primary-100', icon: 'text-primary-600' },
  frio: { label: 'Frio', Icon: Snowflake, chip: 'bg-primary-50 ring-1 ring-primary-100', icon: 'text-primary-600' },
};

/** Pílula de tier: ícone de linha + texto em azul-tinta. */
export function TierChip({ tier, compact = false }: { tier: Tier; compact?: boolean }) {
  const t = TIER[tier];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-bold text-neutral-900 ${t.chip}`}
    >
      <t.Icon size={12} strokeWidth={2.25} aria-hidden="true" className={t.icon} />
      {compact ? <span className="sr-only">{t.label}</span> : t.label}
    </span>
  );
}

/**
 * Cor da etapa do funil. As cores do banco (`crm_pipeline_stages.color`) ficam de lado:
 * a etapa é identificada pelo nome (ou pela posição, se o nome for outro) numa escala só
 * de tokens do DS (azul, plano-sereno, plano-sereninho, plano-parceiro, azul-tinta, tinta-media).
 */
const STAGE_BY_NAME: Record<string, string> = {
  novo: 'bg-primary',
  'em contato': 'bg-plano-sereno',
  qualificado: 'bg-plano-sereninho',
  proposta: 'bg-plano-parceiro',
};
const STAGE_BY_POSITION = [
  'bg-primary',
  'bg-plano-sereno',
  'bg-plano-sereninho',
  'bg-plano-parceiro',
  'bg-plano-melhor-amigo',
];

interface StageLike {
  name: string;
  order_index: number;
  is_terminal?: boolean;
}

function isLost(name: string): boolean {
  return /perd/i.test(name);
}

/** Marca da etapa: bolinha colorida; Ganho e Perdido levam ícone (ganho azul-tinta, perdido tinta-media). */
export function StageMark({ stage, position = 0 }: { stage: StageLike; position?: number }) {
  if (stage.is_terminal) {
    const lost = isLost(stage.name);
    const Icon = lost ? XCircle : CheckCircle2;
    return (
      <Icon
        size={16}
        strokeWidth={2.25}
        aria-hidden="true"
        className={lost ? 'text-neutral-700' : 'text-neutral-900'}
      />
    );
  }
  const cls =
    STAGE_BY_NAME[stage.name.trim().toLowerCase()] ??
    STAGE_BY_POSITION[position % STAGE_BY_POSITION.length];
  return <span aria-hidden="true" className={`inline-block h-3 w-3 rounded-full ${cls}`} />;
}

/** Aviso de estado em caixa fundo-suave com ícone (sem vermelho). */
export function Notice({
  children,
  tone = 'info',
}: {
  children: React.ReactNode;
  tone?: 'info' | 'warn';
}) {
  return (
    <div
      role={tone === 'warn' ? 'alert' : undefined}
      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-neutral-900 ${
        tone === 'warn' ? 'bg-accent-100' : 'bg-primary-50'
      }`}
    >
      <AlertCircle size={16} strokeWidth={2.25} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
