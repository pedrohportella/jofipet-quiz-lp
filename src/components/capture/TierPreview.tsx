'use client';

import { motion } from 'framer-motion';
import { PlanoDestaque } from '@/components/result/PlanoDestaque';
import { IconeEmoji } from '@/components/shared/IconeEmoji';
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

/**
 * Prévia da cobertura na captura (fase 3 do design system): a faixa do plano, na cor e com o pet
 * daquela assinatura, e embaixo o que ela inclui.
 */
export function TierPreview({ tier, answers }: TierPreviewProps) {
  const gastoMensal = typeof answers['gasto-mensal'] === 'number' ? answers['gasto-mensal'] : null;
  const plano = getRecommendedPlan(gastoMensal, tier);
  const bullet = plano.bullets.slice(0, 3).join(' + ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      className="flex w-full flex-col gap-3 text-center"
    >
      <PlanoDestaque plano={plano} kicker={TIER_KICKER[tier]} />
      <p className="text-sm font-medium text-neutral-700">
        <IconeEmoji emoji="✓" className="mr-1 inline h-4 w-4 text-accent" />
        {bullet}
      </p>
      <p className="text-xs font-semibold text-neutral-500">
        Conta seus dados e nosso time te atende no WhatsApp
      </p>
    </motion.div>
  );
}
