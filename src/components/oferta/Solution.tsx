'use client';

import { ShieldCheck, MessageCircle, Stethoscope } from 'lucide-react';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Cobertura ampla, zero pegadinha',
    body: 'Consultas, vacinação, exames, emergências e cirurgias. Sem coparticipação, sem limite escondido.',
  },
  {
    icon: MessageCircle,
    title: 'Atendimento humano 24h',
    body: 'Nosso time tira suas dúvidas no WhatsApp, qualquer hora. Sem chatbot, sem URA.',
  },
  {
    icon: Stethoscope,
    title: 'Rede credenciada de confiança',
    body: 'Vets parceiros selecionados pela Jofi. Você não precisa ficar caçando profissional bom — já indicamos.',
  },
];

export function Solution() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="jofi-kicker mb-2 text-primary">A solução Jofi</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Tudo que seu pet precisa,
            <br />
            <span className="text-primary">cabendo no seu bolso.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">{b.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-700">{b.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
