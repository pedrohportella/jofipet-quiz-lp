'use client';

import { useState } from 'react';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';
import { loadStoredUtms } from '@/lib/tracking/utms';
import { trackWhatsappClick, trackInitiateCheckout } from '@/lib/tracking/events';
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

  const url = buildWhatsappUrl(phoneNumber, { tier, especie, idade, utms });

  const handleClick = () => {
    // Clique no WhatsApp = forte sinal de intenção. Dispara:
    //   - Lead event via Pixel (existente, sem CAPI — é só ack que clicou)
    //   - InitiateCheckout via Pixel + CAPI server (mensurado pela Meta como conversão)
    // Context 'wa_click' diferencia de view/sereninho_click no dedup.
    trackWhatsappClick({ tier, utms });
    trackInitiateCheckout({
      tier,
      value: TIER_VALUE[tier],
      leadId: state.leadId ?? undefined,
      context: 'wa_click',
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
        Falar com a Jofi no WhatsApp 🐾
      </a>
      {clicked && (
        <p className="mt-2 text-center text-sm font-medium text-neutral-700">
          Te esperamos na conversa 🐾
        </p>
      )}
    </>
  );
}
