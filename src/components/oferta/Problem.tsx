'use client';

import { AlertCircle, Wallet, Clock } from 'lucide-react';

const SCENARIOS = [
  {
    icon: AlertCircle,
    title: 'Pet com problema fora de hora',
    body: 'Madrugada, fim de semana, feriado. Vet de plantão custa caro e nem sempre atende. A Jofi tá no WhatsApp 24h pra te orientar antes da emergência virar pânico.',
  },
  {
    icon: Wallet,
    title: 'Conta de vet inesperada',
    body: 'Consulta vira R$ 1.500 quando o vet pede 3 exames. Vacina sozinha já passa de R$ 200. Castração? R$ 800 a R$ 1.800. Com a Jofi, você pagou R$ 79 e tá tudo coberto.',
  },
  {
    icon: Clock,
    title: 'Esperar e o problema crescer',
    body: 'Sem cobertura, dá pra empurrar pro mês que vem. E o pet sofre em silêncio. Quando chega no vet, o problema cresceu — custa mais, dói mais, demora mais.',
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
            Cuidar de pet sem cobertura
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
                className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md md:items-start md:text-left"
              >
                <Icon className="h-8 w-8 text-accent" strokeWidth={2} aria-hidden="true" />
                <h3 className="text-lg font-bold text-neutral-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-700">{s.body}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-base text-neutral-700 md:text-lg">
          A Jofi existe pra você nunca mais passar por isso.{' '}
          <strong>Cobertura completa</strong> a partir de
          <strong> R$ 49,90/mês</strong>.
        </p>
      </div>
    </section>
  );
}
