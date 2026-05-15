'use client';

import { ShieldCheck, Award, Lock } from 'lucide-react';

const TRUST_SIGNALS = [
  {
    icon: ShieldCheck,
    title: '30 dias pra cancelar',
    body: 'Sem multa, sem letra miúda. Testou e não rolou? É só avisar.',
  },
  {
    icon: Award,
    title: '+500 tutores Jofi',
    body: 'Comunidade ativa que cuida do pet com a gente desde 2024.',
  },
  {
    icon: Lock,
    title: 'LGPD compliant',
    body: 'Seus dados ficam protegidos. Nunca compartilhamos com terceiros.',
  },
];

export function Guarantee() {
  return (
    <section className="bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {TRUST_SIGNALS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-500">
                  <Icon className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-neutral-900">{s.title}</h3>
                  <p className="text-sm text-neutral-700">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
