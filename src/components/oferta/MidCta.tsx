'use client';

import { useOfertaCapture } from './OfertaCaptureContext';

export function MidCta() {
  const { open } = useOfertaCapture();

  const handleClick = () => {
    open({ source: 'mid' });
  };

  return (
    <section className="bg-primary py-10 text-white md:py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center md:px-8">
        <h2
          className="text-2xl uppercase leading-tight sm:text-3xl md:text-4xl"
          style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
        >
          Não sabe qual plano escolher?
        </h2>
        <p className="max-w-xl text-base opacity-90">
          Nosso time te ajuda em 5 minutos. Sem compromisso, sem venda agressiva — só uma
          conversa pra entender o que faz sentido pro seu pet.
        </p>
        <button
          type="button"
          onClick={handleClick}
          className="jofi-btn jofi-btn--whatsapp mt-2 w-full max-w-sm sm:w-auto sm:min-w-[280px] !bg-white !text-success-700 hover:!bg-cream"
        >
          Conversar com nosso time agora 🐾
        </button>
        <p className="text-xs opacity-75">Resposta em minutos · Atendimento 24h</p>
      </div>
    </section>
  );
}
