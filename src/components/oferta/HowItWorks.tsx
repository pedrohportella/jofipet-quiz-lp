'use client';

import { motion } from 'framer-motion';

/**
 * Section "Como Funciona" — 4 passos oficiais do site jofi.pet.
 *
 * Posicionamento estratégico: aparece DEPOIS de Solution (mostrou benefícios)
 * e ANTES de VideoSection (vídeo aprofunda). Quebra de objeção "como contratar?"
 * com fluxo simples e claro.
 *
 * Copy: frases extraídas do site Jofi (com mínimas adaptações pra contexto LP).
 */

const STEPS = [
  {
    n: 1,
    title: 'Você conta sobre o seu pet',
    body: 'Espécie, idade e hábitos. Em segundos a gente entende o que faz sentido pro seu pequeno.',
  },
  {
    n: 2,
    title: 'Escolhe a cobertura ideal',
    body: 'Sereninho, Sereno, Parceiro ou Melhor Amigo — 4 opções pra todo orçamento e momento de vida.',
  },
  {
    n: 3,
    title: 'Decide qual parceiro te atende',
    body: 'Rede credenciada Jofi nas principais cidades. Você escolhe o vet perto de você.',
  },
  {
    n: 4,
    title: 'Pronto! Já pode usar',
    body: 'Sem burocracia, sem espera. Consulta marcada e cobertura ativa.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="jofi-kicker mb-2 text-primary">Simples e direto</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Como funciona
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-neutral-700">
            Sem burocracias dos modelos convencionais. Em 4 passos seu pet está
            com a Jofi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-4 lg:gap-5">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative flex flex-col gap-3"
            >
              {/* Número grande + linha conectora (visível só em desktop) */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-extrabold text-white shadow-md"
                  aria-hidden="true"
                >
                  {step.n}
                </div>
                {/* Conector horizontal — só desktop, só nos passos 1-3 */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden h-px flex-1 bg-neutral-300 lg:block" />
                )}
              </div>

              <h3 className="text-lg font-bold leading-tight text-neutral-900">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-700">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
