'use client';

import { useState } from 'react';
import { useQuizState } from '@/hooks/useQuizState';

interface SaveForLaterCtaProps {
  whatsappNumber: string;
}

function buildSummaryUrl(whatsappNumber: string, leadName: string | null, tier: string): string {
  const greeting = leadName ? `Oi ${leadName.split(' ')[0]}!` : 'Oi!';
  const summary = `${greeting} Aqui está o resultado do seu quiz Jofi 🐾\n\nSeu perfil: ${tier.toUpperCase()}\n\nQuando estiver pronto, é só responder essa mensagem 💛`;
  const params = new URLSearchParams({ phone: whatsappNumber, text: summary });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

export function SaveForLaterCta({ whatsappNumber }: SaveForLaterCtaProps) {
  const { state } = useQuizState();
  const [clicked, setClicked] = useState(false);

  if (!whatsappNumber || !state.tier) return null;

  const url = buildSummaryUrl(whatsappNumber, state.leadName, state.tier);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setClicked(true)}
      className="text-center text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-700"
    >
      {clicked ? 'Resultado enviado ✓' : 'Salvar resultado pra depois →'}
    </a>
  );
}
