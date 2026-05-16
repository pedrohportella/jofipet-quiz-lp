'use client';

import { motion } from 'framer-motion';
import type { Tier } from '@/lib/quiz/types';

interface TierPreviewProps {
  tier: Tier;
}

// Bullets alinhados com o folder oficial Jofi (catalog.ts).
// Mantém só 3-4 itens por linha pra caber no card preview sem quebrar layout.
const TIER_HEADLINES: Record<
  Tier,
  { emoji: string; kicker: string; headline: string; subhead: string; bullet: string }
> = {
  quente: {
    emoji: '🔥',
    kicker: 'Você é um tutor protetor',
    headline: 'Plano Parceiro',
    subhead: 'Proteção completa pro seu companheiro de toda hora.',
    bullet: 'Internamento + cirurgias + especialistas + tomografia',
  },
  morno: {
    emoji: '🌻',
    kicker: 'Você é um tutor consciente',
    headline: 'Plano Sereno',
    subhead: 'Cuidado preventivo pra ter tranquilidade no dia a dia.',
    bullet: 'Vacinação completa + exames de imagem + sedação',
  },
  frio: {
    emoji: '💙',
    kicker: 'Você é um tutor cuidadoso',
    headline: 'Plano Sereninho',
    subhead: 'O essencial pra começar a cuidar do seu pet com carinho.',
    bullet: 'Consultas clínicas + vacinação + exames de rotina',
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
      <motion.span
        className="text-4xl"
        aria-hidden="true"
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1.1, 1] }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {data.emoji}
      </motion.span>
      <p className="jofi-kicker text-primary">{data.kicker}</p>
      <h2
        className="text-3xl uppercase leading-[0.95] text-neutral-900"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        {data.headline}
      </h2>
      <p className="text-sm text-neutral-700">{data.subhead}</p>
      <p className="text-sm text-neutral-700">✓ {data.bullet}</p>
      <p className="mt-1 text-xs font-semibold text-neutral-500">
        Conta seus dados e nosso time te atende no WhatsApp 🐾
      </p>
    </motion.div>
  );
}
