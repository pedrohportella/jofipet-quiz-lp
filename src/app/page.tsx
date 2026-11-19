import Link from 'next/link';
import Image from 'next/image';
import { HomeSocialProof } from '@/components/quiz/HomeSocialProof';
import { ResumeQuizBanner } from '@/components/quiz/ResumeQuizBanner';

/**
 * Porta de entrada do quiz, no design system da Jofi (fase 2, 18/11/2026): fundo azul, logo
 * branca, título grande em branco com uma palavra em amarelo, estrelas brancas nos cantos e o
 * botão laranja. O texto e o destino (`/quiz/0`) são os de antes.
 */
export default function HomePage() {
  return (
    <>
      <ResumeQuizBanner />
      <div className="relative isolate min-h-[100dvh] overflow-hidden bg-primary">
        {/* Recorte de boas-vindas: ancorado na viewport (a coluna do main tem só 600px) */}
        <img
          src="/decor/dog-welcome.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 -z-10 hidden w-52 select-none md:block lg:w-64"
        />
        {/* Estrelas brancas cortadas nos cantos, como no componente Fundo do DS */}
        <Image
          src="/institucional/estrela-amarelo.png"
          alt=""
          aria-hidden="true"
          width={500}
          height={500}
          style={{ opacity: 0.2, filter: 'brightness(0) invert(1)' }}
          className="pointer-events-none absolute -left-16 -top-16 -z-10 h-44 w-44 select-none md:-left-20 md:-top-20 md:h-64 md:w-64"
        />
        <Image
          src="/institucional/estrela-amarelo.png"
          alt=""
          aria-hidden="true"
          width={500}
          height={500}
          style={{ opacity: 0.2, filter: 'brightness(0) invert(1)' }}
          className="pointer-events-none absolute -bottom-20 -right-16 -z-10 h-48 w-48 select-none md:-bottom-28 md:h-72 md:w-72"
        />

        <main className="relative mx-auto flex min-h-[100dvh] max-w-mobile flex-col items-center justify-center gap-7 px-4 py-10 text-center md:max-w-desktop">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/institucional/logo-branca.png"
              alt="Jofi"
              width={920}
              height={1000}
              priority
              sizes="96px"
              className="h-24 w-auto"
            />
            <p className="rounded-2xl bg-highlight px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-neutral-900">
              Assinatura de saúde pet
            </p>
          </div>

          <h1
            className="text-[2.4rem] uppercase leading-[1] text-white [text-wrap:balance] sm:text-5xl md:text-7xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Qual cobertura Jofi
            <br />
            <span className="text-highlight">combina com seu pet?</span>
          </h1>

          <p className="max-w-sm text-base font-medium text-white md:text-lg">
            Em <strong>~90 segundos</strong>, a gente te mostra qual das 4 coberturas Jofi faz mais
            sentido pra rotina, idade e bolso do seu pequeno.
          </p>

          <HomeSocialProof />

          <Link
            href="/quiz/0"
            className="jofi-btn jofi-btn--primary mt-2 w-full max-w-sm"
          >
            Começar o quiz →
          </Link>

          <p className="text-xs font-medium text-white">
            Sem cadastro · 100% gratuito · Atendimento humano via WhatsApp no final
          </p>
        </main>
      </div>
    </>
  );
}
