import Link from 'next/link';
import Image from 'next/image';
import { HomeSocialProof } from '@/components/quiz/HomeSocialProof';
import { ResumeQuizBanner } from '@/components/quiz/ResumeQuizBanner';

export default function HomePage() {
  return (
    <>
      <ResumeQuizBanner />
      <div className="relative isolate overflow-hidden">
        {/* Recorte de boas-vindas — ancorado na viewport (a coluna do main tem só 600px) */}
        <img
          src="/decor/dog-welcome.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 -z-10 hidden w-52 select-none md:block lg:w-64"
        />
      <main className="relative isolate mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center justify-center gap-7 overflow-hidden px-4 py-10 text-center md:max-w-desktop">
        {/* Patinhas decorativas de fundo (home) */}
        <img
          src="/decor/patinhas-home.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -left-2 top-10 -z-10 w-24 -rotate-12 select-none md:left-6 md:w-32"
        />
        <img
          src="/decor/patinhas-home.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 bottom-12 -z-10 w-28 rotate-6 select-none md:right-8 md:w-40"
        />
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/brand/jofi/variant-6.svg"
          alt="Jofi"
          width={240}
          height={96}
          priority
          className="h-20 w-auto md:h-24"
        />
        <p className="jofi-kicker text-primary">Assinatura de Saúde Pet</p>
      </div>

      <h1
        className="text-[2rem] uppercase leading-[0.95] text-neutral-900 sm:text-4xl md:text-6xl"
        style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
      >
        Qual cobertura Jofi
        <br />
        <span className="text-accent">combina com seu pet?</span>
      </h1>

      <p className="max-w-sm text-base text-neutral-700 md:text-lg">
        Em <strong>~90 segundos</strong>, a gente te mostra qual das 4 coberturas Jofi
        faz mais sentido pra rotina, idade e bolso do seu pequeno 🐾
      </p>

      <HomeSocialProof />

      <Link
        href="/quiz/0"
        className="jofi-btn jofi-btn--primary mt-2 w-full max-w-sm"
      >
        Começar o quiz →
      </Link>

      <p className="text-xs text-neutral-500">
        Sem cadastro · 100% gratuito · Atendimento humano via WhatsApp no final
      </p>
      </main>
      </div>
    </>
  );
}
