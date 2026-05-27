'use client';

import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  city: string;
  plan: string;
  rating: number;
  body: string;
  /** Inicial pra avatar quando não tem foto */
  initial: string;
}

// TODO Pedrão: substituir testemunhos placeholder por 3 casos reais aprovados pelo Ricardo.
// Cada caso deve ter: foto real, nome, cidade, cobertura assinada, depoimento concreto
// (idealmente mencionando: emoção, nome do pet, clínica/hospital usado, valor pago coberto vs custo sem cobertura).
// Bloqueio: até dia 5 da semana 1 (Sprint 2 Plano de Ação Meta).
const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Camila R.',
    city: 'Recife/PE',
    plan: 'Sereno',
    rating: 5,
    initial: 'C',
    body:
      'Tinha medo de assinar cobertura pet porque achei que era pegadinha. O time da Jofi me explicou tudo no WhatsApp em 10 minutos. Já usei pra 2 emergências do Théo. Vale cada centavo.',
  },
  {
    name: 'Roberto M.',
    city: 'João Pessoa/PB',
    plan: 'Parceiro',
    rating: 5,
    initial: 'R',
    body:
      'Minha cachorra idosa começou a precisar de muito vet. Sem o Parceiro eu já teria gastado uns 8 mil só esse ano. Com a Jofi, pago R$ 169,90/mês e durmo tranquilo.',
  },
  {
    name: 'Ana C.',
    city: 'Olinda/PE',
    plan: 'Sereninho',
    rating: 5,
    initial: 'A',
    body:
      'Adotei a Luna filhote e queria proteção sem gastar fortuna. O Sereninho cobre vacina, consulta e exame. Atendimento humano demais — recomendo de olhos fechados.',
  },
];

export function Testimonials() {
  return (
    <section className="bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="jofi-kicker mb-2 text-accent">Tutores Jofi</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            +500 famílias já cuidam
            <br />
            <span className="text-accent">com a Jofi.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <article
              key={i}
              className="relative flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
            >
              <Quote
                className="absolute right-4 top-4 h-8 w-8 text-primary/15"
                aria-hidden="true"
              />
              <div className="flex gap-0.5" aria-label={`${t.rating} de 5 estrelas`}>
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-accent text-accent"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-[15px] leading-relaxed text-neutral-700 md:text-sm">
                &ldquo;{t.body}&rdquo;
              </p>
              <footer className="flex items-center gap-3 border-t border-neutral-200 pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                  {t.initial}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-500">
                    {t.city} · {t.plan}
                  </p>
                </div>
              </footer>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          {/* TODO: substituir EXEMPLO por testemunhos reais Jofi */}
          ⚠️ Testemunhos em fase de coleta — substituir por casos reais Jofi antes do go-live de junho/2026.
        </p>
      </div>
    </section>
  );
}
