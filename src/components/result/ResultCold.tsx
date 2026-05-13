'use client';

import { useEffect } from 'react';
import { ArticleCards } from './ArticleCards';
import { NewsletterCta } from './NewsletterCta';
import {
  buildResultVars,
  getHeadline,
  getSubheadline,
} from '@/lib/quiz/result-template';
import { fbqTrack } from '@/lib/tracking/meta-pixel';
import type { Answers } from '@/lib/quiz/types';

interface ResultColdProps {
  leadName: string | null;
  answers: Answers;
}

export function ResultCold({ leadName, answers }: ResultColdProps) {
  const vars = buildResultVars({ tier: 'frio', leadName, answers });

  useEffect(() => {
    fbqTrack('ViewContent', { content_name: 'result_cold' });
  }, []);

  return (
    <>
      <span className="text-5xl" aria-hidden="true">
        💙
      </span>
      <p className="jofi-kicker text-primary">Perfil informativo</p>
      <h1
        className="text-4xl uppercase leading-[0.95] text-neutral-900 md:text-5xl"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        {getHeadline('frio')}
      </h1>
      <p className="max-w-md text-base text-neutral-700">
        {getSubheadline('frio', vars)}
      </p>
      <div className="mt-2 flex w-full max-w-md flex-col gap-4">
        <ArticleCards />
        <div className="border-t border-neutral-300 pt-4">
          <NewsletterCta label="Receber o guia completo da Jofi" />
        </div>
      </div>
    </>
  );
}
