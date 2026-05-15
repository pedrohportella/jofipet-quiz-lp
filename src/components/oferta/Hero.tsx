'use client';

import { PawPrint } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackLpOfertaWhatsappClick } from '@/lib/tracking/oferta-events';
import { trackWhatsappClick } from '@/lib/tracking/events';
import { loadStoredUtms } from '@/lib/tracking/utms';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';

interface HeroProps {
  whatsappNumber: string;
}

export function Hero({ whatsappNumber }: HeroProps) {
  const utms = loadStoredUtms();
  const waUrl = whatsappNumber
    ? buildWhatsappUrl(whatsappNumber, { utms, source: 'oferta_lp' })
    : '#planos';

  const handleClick = () => {
    trackLpOfertaWhatsappClick('hero');
    if (whatsappNumber) trackWhatsappClick({ tier: 'quente', utms });
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 via-secondary to-secondary">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-10 pt-8 text-center md:flex-row md:gap-12 md:px-8 md:py-20 md:text-left">
        {/* Visual MOBILE-ONLY: aparece em mobile no topo, com altura controlada
            pra não dominar viewport. Cria âncora emocional antes do texto.
            Em desktop, esse fica oculto (o visual desktop entra ao lado). */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-[5/3] w-full max-w-xs overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg md:hidden"
          aria-hidden="true"
        >
          {/* TODO Pedro/Jofi: substituir por foto real Jofi (5:3, 500x300 mobile) */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🐶🐱
          </div>
        </motion.div>

        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          {/* Header da marca — stack vertical mobile (evita overflow em 320px),
              row em sm+ */}
          <div className="mb-4 flex flex-col items-center gap-1 sm:flex-row sm:flex-wrap sm:gap-2 md:justify-start">
            <div className="flex items-center gap-2">
              <PawPrint className="h-6 w-6 text-primary md:h-7 md:w-7" strokeWidth={2.5} aria-hidden="true" />
              <span
                className="text-2xl text-primary"
                style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
              >
                JOFI
              </span>
            </div>
            <span className="jofi-kicker text-primary">Plano de saúde pet</span>
          </div>

          <h1
            className="text-[2rem] uppercase leading-[0.95] text-neutral-900 sm:text-4xl md:text-6xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Cuidar do seu pet
            <br />
            <span className="text-accent">do jeito certo.</span>
          </h1>

          <p className="mt-4 max-w-md text-base text-neutral-700 md:text-lg">
            Planos pet a partir de <strong>R$ 49,90/mês</strong>. Atendimento humano,
            cobertura ampla e zero burocracia. Mais de 500 tutores já cuidam com a Jofi 🐾
          </p>

          {/* CTA — w-full mobile pra ocupar viewport, max-w pra não esticar absurdo
              em tablet portrait; sm:min-w aplicável só em sm+ */}
          <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:items-center sm:gap-4 md:items-start">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="jofi-btn jofi-btn--whatsapp w-full sm:w-auto sm:min-w-[280px]"
            >
              Falar com nosso time no WhatsApp 🐾
            </a>
            <a
              href="#planos"
              className="text-center text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-700 sm:text-left"
            >
              Conhecer os planos ↓
            </a>
          </div>

          <p className="mt-4 text-center text-xs text-neutral-500 md:text-left">
            ⭐ +500 tutores · Atendimento 24h · LGPD compliant
          </p>
        </motion.div>

        {/* Visual DESKTOP — escondido em mobile (já tem o visual mobile acima) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden flex-1 md:block"
        >
          {/* TODO Pedro/Jofi: substituir por foto real Jofi (1:1 quadrado, 600x600 idealmente) */}
          <div
            className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-xl"
            aria-label="Imagem ilustrativa de pet"
          >
            <div className="absolute inset-0 flex items-center justify-center text-9xl">
              🐶🐱
            </div>
            <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700 backdrop-blur">
              Placeholder · Substituir por foto real
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
