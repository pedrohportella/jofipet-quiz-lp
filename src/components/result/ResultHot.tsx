'use client';

import { useEffect } from 'react';
import { ResultBullets } from './ResultBullets';
import { WhatsappCta } from './WhatsappCta';
import { AttendantCard } from './AttendantCard';
import { SaveForLaterCta } from './SaveForLaterCta';
import { NewsletterCta } from './NewsletterCta';
import {
  buildResultVars,
  getHeadline,
  getSubheadline,
  getBullets,
} from '@/lib/quiz/result-template';
import { trackInitiateCheckout } from '@/lib/tracking/events';
import type { Answers } from '@/lib/quiz/types';

interface ResultHotProps {
  leadId: string | null;
  leadName: string | null;
  answers: Answers;
  whatsappNumber: string;
}

export function ResultHot({ leadId, leadName, answers, whatsappNumber }: ResultHotProps) {
  const vars = buildResultVars({ tier: 'quente', leadName, answers });

  useEffect(() => {
    // value 89.9 = approx valor do Plano Parceiro (tier quente)
    // leadId passado → CAPI server-side dispara com mesmo event_id pra dedup
    trackInitiateCheckout({
      tier: 'quente',
      value: 89.9,
      leadId: leadId ?? undefined,
      context: 'view',
    });
  }, [leadId]);

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

        {/* CTA secundário: quem prefere asincronia (não quer WhatsApp agora).
            UX hypothesis: ~20-30% dos leads quentes preferem proposta por email
            antes de iniciar conversa — capturar esse segmento evita perda. */}
        <div className="border-t border-neutral-300 pt-4">
          <NewsletterCta label="Ou prefere receber uma proposta por email?" />
        </div>
      </div>
    </>
  );
}
