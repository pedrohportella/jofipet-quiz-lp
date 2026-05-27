'use client';

import { useState } from 'react';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';
import { loadStoredUtms } from '@/lib/tracking/utms';
import { trackWhatsappClick, trackInitiateCheckout } from '@/lib/tracking/events';
import { trackWhatsAppClickFromQuiz } from '@/lib/tracking/quiz-events';
import { useQuizState } from '@/hooks/useQuizState';
import type { Answers, Tier } from '@/lib/quiz/types';

interface WhatsappCtaProps {
  tier: Tier;
  answers: Answers;
  phoneNumber: string;
}

// Tier → valor aproximado pra Meta usar como lead value em InitiateCheckout.
// Match com TIER_LEAD_VALUE em /api/leads/route.ts pra consistência.
const TIER_VALUE: Record<Tier, number> = {
  quente: 89.9,
  morno: 49.9,
  frio: 0,
};

export function WhatsappCta({ tier, answers, phoneNumber }: WhatsappCtaProps) {
  const { state } = useQuizState();
  const [clicked, setClicked] = useState(false);

  if (!phoneNumber) {
    return (
      <div className="rounded-lg bg-cream px-4 py-3 text-sm text-neutral-700">
        WhatsApp em configuração — em breve te conectamos com a Jofi.
      </div>
    );
  }

  const utms = loadStoredUtms();
  const especie = String(answers['especie'] ?? '');
  const idade = String(answers['idade'] ?? '');
  const cidade = typeof answers['cidade'] === 'string' ? answers['cidade'] : null;
  const preocupacao =
    typeof answers['preocupacao'] === 'string' ? answers['preocupacao'] : null;
  const planoAtual =
    typeof answers['plano-atual'] === 'string' ? answers['plano-atual'] : null;
  const gasto = answers['gasto-mensal'];
  const ultimaVet = answers['ultima-vet'];
  const gastoMensal = typeof gasto === 'number' ? gasto : null;
  const ultimaVetLabel = typeof ultimaVet === 'string' ? ultimaVet : null;

  // Mensagem enriquecida com nome, gasto e última visita ao vet —
  // O time abre o chat já com o contexto todo do quiz.
  const url = buildWhatsappUrl(phoneNumber, {
    tier,
    especie,
    idade,
    utms,
    leadName: state.leadName,
    gastoMensal,
    ultimaVet: ultimaVetLabel,
  });

  const handleClick = () => {
    // Clique no WhatsApp = forte sinal de intenção. Dispara:
    //   - Lead event via Pixel (existente, sem CAPI — é só ack que clicou)
    //   - InitiateCheckout via Pixel + CAPI server (mensurado pela Meta como conversão)
    //   - WA click from quiz (Sprint 2 — dossiê pré-preenchido, GA + Pixel custom)
    // Context 'wa_click' diferencia de view/sereninho_click no dedup.
    trackWhatsappClick({ tier, utms });
    trackInitiateCheckout({
      tier,
      value: TIER_VALUE[tier],
      leadId: state.leadId ?? undefined,
      context: 'wa_click',
    });
    trackWhatsAppClickFromQuiz({
      tier,
      especie,
      idade,
      cidade,
      preocupacao,
      gastoMensal,
      planoAtual,
      ultimaVet: ultimaVetLabel,
    });
    setClicked(true);
  };

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="jofi-btn jofi-btn--whatsapp w-full"
      >
        Falar com nosso time no WhatsApp 🐾
      </a>
      {clicked && (
        <p className="mt-2 text-center text-sm font-medium text-neutral-700">
          Te esperamos na conversa 🐾
        </p>
      )}
    </>
  );
}
