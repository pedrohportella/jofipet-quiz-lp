'use client';

import { motion } from 'framer-motion';
import type { Tier } from '@/lib/quiz/types';

interface TierPreviewProps {
  tier: Tier;
}

const TIER_HEADLINES: Record<Tier, { emoji: string; kicker: string; headline: string; bullet: string }> = {
  quente: {
    emoji: '🔥',
    kicker: 'Identificamos seu perfil',
    headline: 'Plano Parceiro',
    bullet: 'Internação 24h + cirurgias + especialistas inclusos',
  },
  morno: {
    emoji: '🌻',
    kicker: 'Identificamos seu perfil',
    headline: 'Plano Sereno',
    bullet: 'Vacinação completa + consultas 24h + exames laboratoriais',
  },
  frio: {
    emoji: '💙',
    kicker: 'Identificamos seu perfil',
    headline: 'Plano Sereninho',
    bullet: 'Consultas + vacinas essenciais + exames iniciais',
  },
};

export function TierPreview({ tier }: TierPreviewProps) {
  const data = TIER_HEADLINES[tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className="flex w-full flex-col items-center gap-2 rounded-xl bg-cream px-4 py-5 text-center"
    >
      <span className="text-3xl" aria-hidden="true">
        {data.emoji}
      </span>
      <p className="jofi-kicker text-primary">{data.kicker}</p>
      <h2
        className="text-3xl uppercase leading-[0.95] text-neutral-900"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        {data.headline}
      </h2>
      <p className="text-sm text-neutral-700">✓ {data.bullet}</p>
      <p className="mt-1 text-xs font-semibold text-neutral-500">
        Conta seus dados pra liberar o diagnóstico completo →
      </p>
    </motion.div>
  );
}
