'use client';

import { trackLpOfertaWhatsappClick } from '@/lib/tracking/oferta-events';
import { trackWhatsappClick } from '@/lib/tracking/events';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';
import { loadStoredUtms } from '@/lib/tracking/utms';

interface FinalCtaProps {
  whatsappNumber: string;
}

export function FinalCta({ whatsappNumber }: FinalCtaProps) {
  const utms = loadStoredUtms();
  const waUrl = whatsappNumber
    ? buildWhatsappUrl(whatsappNumber, { utms, source: 'oferta_lp' })
    : '#planos';

  const handleClick = () => {
    trackLpOfertaWhatsappClick('final');
    if (whatsappNumber) trackWhatsappClick({ tier: 'quente', utms });
  };

  return (
    <section className="bg-gradient-to-b from-secondary to-cream py-16 md:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 text-center md:px-8">
        <span className="text-6xl" aria-hidden="true">
          🐾
        </span>
        <h2
          className="text-4xl uppercase leading-[0.95] text-neutral-900 md:text-5xl"
          style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
        >
          Pronto pra cuidar
          <br />
          <span className="text-accent">do jeito certo?</span>
        </h2>
        <p className="max-w-md text-base text-neutral-700 md:text-lg">
          A Nicole tá esperando você no WhatsApp pra explicar tudo e ajudar a escolher o plano
          ideal pro seu pet. Sem compromisso. 💛
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="jofi-btn jofi-btn--whatsapp jofi-btn--pulse mt-2 min-w-[280px]"
        >
          Falar com a Nicole agora 🐾
        </a>
        <p className="text-xs text-neutral-500">
          Atendimento humano · Resposta em minutos · Sem fidelidade
        </p>
      </div>
    </section>
  );
}
