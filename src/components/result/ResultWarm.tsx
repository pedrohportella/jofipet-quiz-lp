'use client';

import { useEffect } from 'react';
import { ResultBullets } from './ResultBullets';
import { SereninhoCta } from './SereninhoCta';
import { NewsletterCta } from './NewsletterCta';
import { SaveForLaterCta } from './SaveForLaterCta';
import { WhatsappAutoRedirect } from './WhatsappAutoRedirect';
import {
  buildResultVars,
  getHeadline,
  getSubheadline,
  getBullets,
} from '@/lib/quiz/result-template';
import { trackInitiateCheckout } from '@/lib/tracking/events';
import type { Answers } from '@/lib/quiz/types';

interface ResultWarmProps {
  leadId: string | null;
  leadName: string | null;
  answers: Answers;
  sereninhoUrl: string;
  whatsappNumber: string;
}

export function ResultWarm({
  leadId,
  leadName,
  answers,
  sereninhoUrl,
  whatsappNumber,
}: ResultWarmProps) {
  const vars = buildResultVars({ tier: 'morno', leadName, answers });

  useEffect(() => {
    trackInitiateCheckout({
      tier: 'morno',
      value: 49.9,
      leadId: leadId ?? undefined,
      context: 'view',
    });
  }, [leadId]);

  return (
    <>
      {/* Auto-redirect WhatsApp pro morno também — mas tier morno tende a
          ser mais auto-serviço (Sereninho/email), então o cancel é mais comum.
          Mensagem dele é mais suave ("Posso saber mais?" vs "Quero ativar"). */}
      <WhatsappAutoRedirect
        tier="morno"
        leadId={leadId}
        leadName={leadName}
        answers={answers}
        phoneNumber={whatsappNumber}
      />

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
        <SaveForLaterCta whatsappNumber={whatsappNumber} />
        <div className="border-t border-neutral-300 pt-4">
          <NewsletterCta label="Ou receba dicas por email" />
        </div>
      </div>
    </>
  );
}
