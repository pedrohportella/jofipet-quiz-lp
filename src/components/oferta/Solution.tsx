'use client';

import Image from 'next/image';
import { ShieldCheck, MessageCircle, Stethoscope } from 'lucide-react';
import { REDE_TEXT } from '@/lib/oferta/geo';

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Cobertura sem pegadinha',
    body: 'Consultas, vacinação, exames, emergências e cirurgias. Você vê o valor e a carência de cada item antes de contratar, e sabe exatamente o que tá levando.',
  },
  {
    icon: MessageCircle,
    title: 'Atendimento humano de verdade',
    body: 'Nosso time tira suas dúvidas no WhatsApp: pessoa de verdade, não bot. E continua disponível depois que você assina, não só pra vender.',
  },
  {
    icon: Stethoscope,
    title: 'Rede de confiança',
    body: REDE_TEXT,
  },
];

export function Solution() {
  return (
    <section className="bg-primary py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="mx-auto mb-3 w-fit rounded-2xl bg-highlight px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-neutral-900">A solução Jofi</p>
          <h2
            className="text-3xl uppercase leading-tight text-white md:text-5xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Cuidado completo,
            <br />
            <span className="text-highlight">com transparência total.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white">
                  <Icon className="h-8 w-8" strokeWidth={2} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-white">{b.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-white">{b.body}</p>
              </div>
            );
          })}
        </div>

        {/* Foto real da equipe — prova visual do "atendimento humano de verdade" */}
        <figure className="mx-auto mt-12 max-w-3xl md:mt-16">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-3xl shadow-lg">
            <Image
              src="/team/equipe-jofi.jpg"
              alt="Equipe Jofi reunida com o cachorro Théo na sede em Recife"
              fill
              sizes="(min-width: 768px) 48rem, 92vw"
              className="object-cover object-center"
              loading="lazy"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm font-medium text-white">
            O time Jofi que te atende no WhatsApp: gente de verdade, em Recife
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
