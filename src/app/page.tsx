import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { HomeSocialProof } from '@/components/quiz/HomeSocialProof';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center justify-center gap-7 px-4 py-10 text-center md:max-w-desktop">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <PawPrint
            className="h-10 w-10 text-primary"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <span
            className="text-4xl text-primary"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            JOFI
          </span>
        </div>
        <p className="jofi-kicker text-primary">Plano de saúde pet</p>
      </div>

      <h1
        className="text-4xl uppercase leading-[0.95] text-neutral-900 md:text-6xl"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        Cuidar hoje.
        <br />
        <span className="text-accent">Proteger sempre.</span>
      </h1>

      <p className="max-w-sm text-base text-neutral-700 md:text-lg">
        Em <strong>~90 segundos</strong>, a gente identifica o plano ideal pro
        seu pequeno 🐾
      </p>

      <HomeSocialProof />

      <Link
        href="/quiz/0"
        className="jofi-btn jofi-btn--primary mt-2 w-full max-w-sm"
      >
        Descobrir meu plano ideal →
      </Link>

      <p className="text-xs text-neutral-500">
        Sem cadastro pra começar · 100% gratuito
      </p>
    </main>
  );
}
