'use client';

import { useEffect } from 'react';
import { ResultBullets } from './ResultBullets';
import { WhatsappCta } from './WhatsappCta';
import { AttendantCard } from './AttendantCard';
import { SaveForLaterCta } from './SaveForLaterCta';
import {
  buildResultVars,
  getHeadline,
  getSubheadline,
  getBullets,
} from '@/lib/quiz/result-template';
import { trackInitiateCheckout } from '@/lib/tracking/events';
import type { Answers } from '@/lib/quiz/types';

interface ResultHotProps {
  leadName: string | null;
  answers: Answers;
  whatsappNumber: string;
}

export function ResultHot({ leadName, answers, whatsappNumber }: ResultHotProps) {
  const vars = buildResultVars({ tier: 'quente', leadName, answers });

  useEffect(() => {
    trackInitiateCheckout({ tier: 'quente' });
  }, []);

  return (
    <>
      <span className="text-5xl" aria-hidden="true">
        🔥
      </span>
      <p className="jofi-kicker text-accent">Perfil quente</p>
      <h1
        className="text-4xl uppercase leading-[0.95] text-neutral-900 md:text-5xl"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        {getHeadline('quente')}
      </h1>
      <p className="max-w-md text-base text-neutral-700">
        {getSubheadline('quente', vars)}
      </p>
      <ResultBullets bullets={getBullets('quente', vars)} />
      <div className="mt-2 flex w-full max-w-md flex-col gap-3">
        <AttendantCard />
        <WhatsappCta tier="quente" answers={answers} phoneNumber={whatsappNumber} />
        <SaveForLaterCta whatsappNumber={whatsappNumber} />
      </div>
    </>
  );
}
