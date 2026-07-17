'use client';

import Image from 'next/image';
import { REDE_TEXT } from '@/lib/oferta/geo';

/**
 * Seção "Onde a Jofi atende" — mapa de cobertura PE/PB/CE.
 * Reforça confiança regional antes da tabela de planos.
 */
export function Coverage() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-2 md:gap-12 md:px-8">
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="jofi-kicker mb-2 text-primary">Onde a Jofi atende</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Cobertura no <span className="text-accent">Nordeste</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-neutral-700 md:mx-0 md:text-lg">
            {REDE_TEXT}
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
            {['Pernambuco', 'Paraíba', 'Ceará'].map((uf) => (
              <li
                key={uf}
                className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary"
              >
                {uf}
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative mx-auto aspect-[615/504] w-full max-w-md">
            <Image
              src="/coverage/mapa-pe-pb-ce.webp"
              alt="Mapa de cobertura Jofi — Pernambuco, Paraíba e Ceará"
              fill
              sizes="(min-width: 768px) 28rem, 90vw"
              className="object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
