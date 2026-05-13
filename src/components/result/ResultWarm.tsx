'use client';

import { useEffect } from 'react';
import { ResultBullets } from './ResultBullets';
import { SereninhoCta } from './SereninhoCta';
import { NewsletterCta } from './NewsletterCta';
import {
  buildResultVars,
  getHeadline,
  getSubheadline,
  getBullets,
} from '@/lib/quiz/result-template';
import { trackInitiateCheckout } from '@/lib/tracking/events';
import type { Answers } from '@/lib/quiz/types';

interface ResultWarmProps {
  leadName: string | null;
  answers: Answers;
  sereninhoUrl: string;
}

export function ResultWarm({ leadName, answers, sereninhoUrl }: ResultWarmProps) {
  const vars = buildResultVars({ tier: 'morno', leadName, answers });

  useEffect(() => {
    trackInitiateCheckout({ tier: 'morno', value: 49.9 });
  }, []);

  return (
    <>
      <span className="text-5xl" aria-hidden="true">
        🌻
      </span>
      <p className="jofi-kicker text-primary">Perfil morno</p>
      <h1
        className="text-4xl uppercase leading-[0.95] text-neutral-900 md:text-5xl"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        {getHeadline('morno')}
      </h1>
      <p className="max-w-md text-base text-neutral-700">
        {getSubheadline('morno', vars)}
      </p>
      <ResultBullets bullets={getBullets('morno', vars)} />
      <div className="mt-2 flex w-full max-w-md flex-col gap-4">
        <SereninhoCta baseUrl={sereninhoUrl} />
        <div className="border-t border-neutral-300 pt-4">
          <NewsletterCta label="Ou receba dicas por email" />
        </div>
      </div>
    </>
  );
}
