import Link from 'next/link';
import Image from 'next/image';
import { HomeSocialProof } from '@/components/quiz/HomeSocialProof';
import { ResumeQuizBanner } from '@/components/quiz/ResumeQuizBanner';

export default function HomePage() {
  return (
    <>
      <ResumeQuizBanner />
      <main className="mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center justify-center gap-7 px-4 py-10 text-center md:max-w-desktop">
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
    </>
  );
}
