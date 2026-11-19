'use client';

import { useEffect } from 'react';
import { IconeEmoji } from '@/components/shared/IconeEmoji';
import { ArticleCards } from './ArticleCards';
import { NewsletterCta } from './NewsletterCta';
import { AttendantCard } from './AttendantCard';
import { WhatsappCta } from './WhatsappCta';
import { SaveForLaterCta } from './SaveForLaterCta';
import {
  buildResultVars,
  getHeadline,
  getSubheadline,
} from '@/lib/quiz/result-template';
import { fbqTrack } from '@/lib/tracking/meta-pixel';import type { Answers } from '@/lib/quiz/types';

interface ResultColdProps {
  leadId: string | null;
  leadName: string | null;
  answers: Answers;
  whatsappNumber: string;
}

export function ResultCold({
  leadId,
  leadName,
  answers,
  whatsappNumber,
}: ResultColdProps) {
  const vars = buildResultVars({ tier: 'frio', leadName, answers });

  useEffect(() => {
    // ResultCold = perfil informativo. ViewContent (não InitiateCheckout) é
    // o evento certo aqui: usuário viu conteúdo mas não está iniciando compra.
    // Pixel só (sem CAPI nesse touchpoint pra evitar ruído nos dados).
    fbqTrack('ViewContent', {
      content_name: 'result_cold',
      content_category: 'frio',
    });
  }, []);

  return (
    <>
      {/* Perfil informativo: sem assinatura recomendada. Faixa azul da marca, com ícone */}
      <div
        className="relative flex min-h-[132px] w-full items-center gap-4 overflow-hidden rounded-[32px] bg-primary p-6 text-left text-white"
      >
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-white"
          aria-hidden="true"
        >
          <IconeEmoji emoji="💙" className="h-7 w-7" />
        </span>
        <p className="text-[12px] font-extrabold uppercase tracking-[0.1em]">Perfil informativo</p>
      </div>
      <h1
        className="text-4xl uppercase leading-[0.95] text-neutral-900 md:text-5xl"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        {getHeadline('frio', vars)}
      </h1>
      <p className="max-w-md text-base text-neutral-700">
        {getSubheadline('frio', vars)}
      </p>
      <div className="mt-2 flex w-full max-w-md flex-col gap-4">
        <ArticleCards />

        {/* CTA low-pressure: sem urgência, só conversa.
            Hipótese: mesmo lead frio que muda de ideia pode querer falar antes de comprar. */}
        {whatsappNumber && (
          <div className="border-t border-neutral-300 pt-4">
            <p className="mb-3 text-left text-sm text-neutral-700">
              Quer tirar dúvidas sobre a cobertura sem compromisso?
            </p>
            <div className="flex flex-col gap-3">
              <AttendantCard />
              <WhatsappCta tier="frio" answers={answers} phoneNumber={whatsappNumber} />
              <SaveForLaterCta whatsappNumber={whatsappNumber} />
            </div>
          </div>
        )}

        <div className="border-t border-neutral-300 pt-4">
          <NewsletterCta label="Receber o guia completo da Jofi" />
        </div>
      </div>
    </>
  );
}
