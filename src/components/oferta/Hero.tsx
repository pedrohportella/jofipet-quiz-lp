'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useOfertaCapture } from './OfertaCaptureContext';

/**
 * H1 do Hero — 3 variantes prontas pra A/B test.
 *   A: base implementada (message-match com "plano de saúde pet")
 *   B: alternativa com preço no H1 (bom pra keyword de intenção alta)
 *   C: variante geográfica (bom pra campanhas por cidade)
 *
 * A cópia da variante A vem colada como JSX abaixo pra permitir marcação
 * visual (span de destaque). B/C ficam como comentário até o próximo teste.
 */
// const H1_B = 'Plano de saúde pet a partir de R$49,90/mês. Do check-up à emergência.';
// const H1_C = 'Plano de saúde pet em [CIDADE]: consultas, vacinas, exames e emergências.';

export function Hero() {
  const { open } = useOfertaCapture();

  const handleClick = () => {
    open({ source: 'hero' });
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-secondary to-secondary">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-10 pt-8 text-center md:flex-row md:gap-12 md:px-8 md:py-20 md:text-left">
        {/* Visual mobile-only */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-video w-full max-w-xs overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg md:hidden"
          aria-hidden="true"
        >
          <Image
            src="/hero/dog-highfive.png"
            alt="Cachorro Jofi dando high-five"
            fill
            sizes="(max-width: 640px) 90vw, 320px"
            className="object-cover object-center"
            priority
            fetchPriority="high"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <div className="mb-4 flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-3 md:justify-start">
            <Image
              src="/brand/jofi/variant-6.svg"
              alt="Jofi"
              width={200}
              height={80}
              priority
              className="h-14 w-auto mix-blend-multiply md:h-20"
            />
            <span className="jofi-kicker text-primary">Assinatura de Saúde Pet</span>
          </div>

          <h1
            className="text-[2rem] uppercase leading-[0.95] text-neutral-900 sm:text-4xl md:text-6xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Plano de saúde pet:
            <br />
            do check-up
            <br />
            à <span className="text-accent">emergência</span>,
            <br />
            tudo num plano só.
          </h1>

          <p className="mt-3 text-base font-semibold text-primary md:text-lg">
            A partir de{' '}
            <span className="text-neutral-900">R$ 49,90/mês</span> · Sem coparticipação
          </p>

          <p className="mt-4 max-w-md text-base text-neutral-700 md:text-lg">
            Cobertura ampla — consultas, vacinas, exames, internação e cirurgias —
            com atendimento humano no WhatsApp. Precisou, usou: sem autorização
            e sem letra miúda 🐾
          </p>

          <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:items-center sm:gap-4 md:items-start">
            <button
              type="button"
              onClick={handleClick}
              className="jofi-btn jofi-btn--whatsapp w-full sm:w-auto sm:min-w-[280px]"
            >
              Falar com nosso time no WhatsApp 🐾
            </button>
            <p className="text-center text-xs text-neutral-600 sm:text-left">
              Resposta em minutos · Atendimento humano · Sem fidelidade
            </p>
            <a
              href="/"
              className="text-center text-sm text-neutral-500 underline underline-offset-4 hover:text-primary sm:text-left"
            >
              Prefere descobrir a cobertura ideal? Faça o quiz em 90s →
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-neutral-500 md:text-left">
            Sem coparticipação · Consultas liberadas no dia 1 · Sem fidelidade · +500 tutores em PE/PB/CE
          </p>
        </motion.div>

        {/* Visual desktop */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden flex-1 md:block"
        >
          <div
            className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl shadow-xl"
            aria-label="Cachorro Jofi dando high-five"
          >
            <Image
              src="/hero/dog-highfive.png"
              alt="Cachorro Jofi dando high-five — atendimento próximo e humano"
              fill
              sizes="(min-width: 1024px) 28rem, (min-width: 768px) 40vw, 0px"
              className="object-cover object-center"
              priority
              fetchPriority="high"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
