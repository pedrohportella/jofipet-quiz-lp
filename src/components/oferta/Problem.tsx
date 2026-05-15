'use client';

import { AlertCircle, Wallet, Clock } from 'lucide-react';

const SCENARIOS = [
  {
    icon: AlertCircle,
    title: 'Pet com problema fora de hora',
    body: 'Madrugada, fim de semana, emergência — vet de plantão cobra fortuna e nem sempre tá disponível.',
  },
  {
    icon: Wallet,
    title: 'Conta de vet inesperada',
    body: 'Aquela consulta de rotina vira R$ 1.500 quando o vet pede 3 exames. Vacina sozinha já passa de R$ 200.',
  },
  {
    icon: Clock,
    title: 'Esperar pra resolver',
    body: 'Sem plano, você adia. E o pet sofre. Quando vai ao vet, o problema cresceu — custa mais e dói mais.',
  },
];

export function Problem() {
  return (
    <section className="bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="jofi-kicker mb-2 text-accent">Você já passou por isso?</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-4xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Cuidar de pet sem plano
            <br />
            <span className="text-accent">é estressante e caro.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {SCENARIOS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <Icon className="h-8 w-8 text-accent" strokeWidth={2} aria-hidden="true" />
                <h3 className="text-lg font-bold text-neutral-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-700">{s.body}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-base text-neutral-700 md:text-lg">
          A Jofi existe pra você nunca mais passar por isso. <strong>Plano completo</strong> a partir de
          <strong> R$ 49,90/mês</strong>.
        </p>
      </div>
    </section>
  );
}
