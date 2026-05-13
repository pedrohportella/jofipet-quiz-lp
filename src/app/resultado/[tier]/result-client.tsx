'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuizState } from '@/hooks/useQuizState';
import { ResultHot } from '@/components/result/ResultHot';
import { ResultWarm } from '@/components/result/ResultWarm';
import { ResultCold } from '@/components/result/ResultCold';
import type { Tier } from '@/lib/quiz/types';

interface ResultClientProps {
  tier: Tier;
  whatsappNumber: string;
  sereninhoUrl: string;
}

export function ResultClient({ tier, whatsappNumber, sereninhoUrl }: ResultClientProps) {
  const router = useRouter();
  const { state, hydrated } = useQuizState();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.tier || !state.finishedAt) {
      router.replace('/');
    }
  }, [hydrated, state.tier, state.finishedAt, router]);

  if (!hydrated || !state.tier) {
    return <p className="text-sm text-neutral-500">Carregando…</p>;
  }

  if (tier === 'quente') {
    return (
      <ResultHot
        leadName={state.leadName}
        answers={state.answers}
        whatsappNumber={whatsappNumber}
      />
    );
  }

  if (tier === 'morno') {
    return (
      <ResultWarm
        leadName={state.leadName}
        answers={state.answers}
        sereninhoUrl={sereninhoUrl}
      />
    );
  }

  return <ResultCold leadName={state.leadName} answers={state.answers} />;
}
