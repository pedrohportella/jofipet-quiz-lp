'use client';

import { motion } from 'framer-motion';
import { getRecommendedPlan } from '@/lib/plans/catalog';
import type { Answers, Tier } from '@/lib/quiz/types';

interface TierPreviewProps {
  tier: Tier;
  answers: Answers;
}

// O KICKER é do tier (a persona/temperatura do lead); o PLANO vem do gasto
// mensal, via catalog.ts. Antes o card inteiro saía do tier e trazia nome,
// subhead e bullets escritos à mão — que divergiam do plano citado na
// mensagem de WhatsApp. Agora só a persona mora aqui.
const TIER_KICKER: Record<Tier, string> = {
  quente: 'Você é um tutor protetor',
  morno: 'Você é um tutor consciente',
  frio: 'Você é um tutor cuidadoso',
};

export function TierPreview({ tier, answers }: TierPreviewProps) {
  const gastoMensal = typeof answers['gasto-mensal'] === 'number' ? answers['gasto-mensal'] : null;
  const plano = getRecommendedPlan(gastoMensal, tier);
  const data = {
    emoji: plano.emoji,
    kicker: TIER_KICKER[tier],
    headline: plano.name,
    subhead: plano.targetPersona,
    bullet: plano.bullets.slice(0, 3).join(' + '),
  };

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
