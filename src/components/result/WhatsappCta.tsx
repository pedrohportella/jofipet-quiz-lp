'use client';

import { useState } from 'react';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';
import { loadStoredUtms } from '@/lib/tracking/utms';
import { trackWhatsappClick } from '@/lib/tracking/events';
import type { Answers, Tier } from '@/lib/quiz/types';

interface WhatsappCtaProps {
  tier: Tier;
  answers: Answers;
  phoneNumber: string;
}

export function WhatsappCta({ tier, answers, phoneNumber }: WhatsappCtaProps) {
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
    trackWhatsappClick({ tier, utms });
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
