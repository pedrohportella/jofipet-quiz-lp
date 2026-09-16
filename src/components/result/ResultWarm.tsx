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
import { WhatsappCta } from './WhatsappCta';
import { trackInitiateCheckout } from '@/lib/tracking/events';
import { getPlanPrice, getRecommendedPlan } from '@/lib/plans/catalog';
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
  const gastoMensal = typeof answers['gasto-mensal'] === 'number' ? answers['gasto-mensal'] : null;
  const plano = getRecommendedPlan(gastoMensal, 'morno');
  const mensalidade = getPlanPrice(plano, answers['idade']).value;

  useEffect(() => {
    // value = mensalidade da cobertura recomendada, na faixa etária do pet
    // (era 49.9 fixo do Sereninho, que desde 08/09/26 não é mais o plano
    // padrão do morno).
    trackInitiateCheckout({
      tier: 'morno',
      value: mensalidade,
      leadId: leadId ?? undefined,
      context: 'view',
    });
  }, [leadId, mensalidade]);

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
        {getHeadline('morno', vars)}
      </h1>
      <p className="max-w-md text-base text-neutral-700">
        {getSubheadline('morno', vars)}
      </p>
      <ResultBullets bullets={getBullets('morno', vars)} />
      <div className="mt-2 flex w-full max-w-md flex-col gap-4">
        {/* O CTA segue a COBERTURA, não o tier: só o Sereninho tem checkout
            próprio (NEXT_PUBLIC_SERENINHO_CHECKOUT_URL). Sereno, Parceiro e
            Melhor Amigo vão pro WhatsApp — decidido em 08/09/26, também porque
            o checkout do site estava com o bug de preço levantado na weekly
            de 27/08 (adesão dobrando a primeira mensalidade). */}
        {plano.id === 'sereninho' ? (
          <SereninhoCta baseUrl={sereninhoUrl} />
        ) : (
          <WhatsappCta tier="morno" answers={answers} phoneNumber={whatsappNumber} />
        )}
        <SaveForLaterCta whatsappNumber={whatsappNumber} />
        <div className="border-t border-neutral-300 pt-4">
          <NewsletterCta label="Ou receba dicas por email" />
        </div>
      </div>
    </>
  );
}
