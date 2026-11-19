'use client';

import Image from 'next/image';
import { IconeEmoji } from '@/components/shared/IconeEmoji';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { PLANS, type Plan } from '@/lib/plans/catalog';
import { IDENTIDADE_PLANO } from '@/lib/plans/identidade';
import { cn } from '@/lib/utils/cn';
import { REDE_TEXT } from '@/lib/oferta/geo';
import { useOfertaCapture } from './OfertaCaptureContext';

/**
 * Tabela visual das 4 coberturas Jofi.
 *
 * Cada clique em "Quero o {Nome}" abre o popup de captura
 * (OfertaCaptureModal). Lead preenche dados, sistema envia pro
 * RD/CAPI/Admin, depois redireciona pro WhatsApp com mensagem rica
 * mencionando a cobertura selecionada.
 */
export function PlanComparison() {
  return (
    <section id="planos" className="scroll-mt-20 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="jofi-kicker mb-2 text-primary">Coberturas Jofi</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-5xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Escolha a cobertura ideal
            <br />
            pro seu <span className="text-primary">pequeno.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-700">
            {REDE_TEXT}{' '}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          {/* TODO Pedro/Jofi: validar carências, limites e bullets de cada cobertura. */}
          Valores &quot;a partir de&quot;: o valor exato considera a idade do pet
          (até 7 anos ou 8+). A carência de cada item e a taxa de adesão, quando
          houver, aparecem antes do pagamento.
        </p>
      </div>
    </section>
  );
}

interface PlanCardProps {
  plan: Plan;
}

function PlanCard({ plan }: PlanCardProps) {
  const { open } = useOfertaCapture();

  const handleClick = () => {
    open({ source: 'card', selectedPlanId: plan.id });
  };

  // Hierarquia visual: só o plano destacado (popular) ganha borda colorida,
  // ring, sombra e leve scale. Os demais ficam neutros pra não competir —
  // 4 bordas coloridas lado a lado diluem o destaque do plano prioritário.
  const accentClass = plan.popular
    ? 'border-accent ring-2 ring-accent/20 shadow-lg md:scale-[1.02]'
    : 'border-neutral-200';

  // Botões: escada de ênfase ao redor do destaque (ghost → azul → LARANJA → ghost).
  // Verde fica reservado pro CTA global de WhatsApp — usar aqui confundiria.
  const buttonClass = {
    primary: 'jofi-btn--primary',
    accent: 'jofi-btn--accent',
    success: 'jofi-btn--ghost border border-neutral-300',
    neutral: 'jofi-btn--ghost border border-neutral-300',
  }[plan.accentColor];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative flex flex-col gap-4 rounded-2xl border-2 bg-white p-5 pt-7 transition-shadow hover:shadow-lg md:p-6 md:pt-7',
        accentClass,
      )}
    >
      {plan.popular && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 4 }}
          whileInView={{ scale: 1, opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.35 }}
          className="absolute -top-3 left-1/2 max-w-[90%] truncate whitespace-nowrap rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm md:text-xs"
          style={{ x: '-50%' }}
        >
          <IconeEmoji emoji="⭐" className="mr-1 inline h-3.5 w-3.5 fill-current align-[-2px]" />Mais escolhido
        </motion.div>
      )}

      <header className="pt-2">
        {/* Faixa na cor da assinatura e o pet dela (artes de outubro), como no site e na captura */}
        <div
          className="relative min-h-[156px] overflow-hidden rounded-3xl p-5 text-left"
          style={{ backgroundColor: IDENTIDADE_PLANO[plan.id].cor, color: IDENTIDADE_PLANO[plan.id].corTexto }}
        >
          <div className="relative z-10 max-w-[58%]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em]">{plan.tagline}</p>
            <h3 className="mt-1 font-display text-[34px] uppercase leading-[0.95]">{plan.name}</h3>
            <p className="mt-2 text-[13px] font-bold leading-snug">{plan.targetPersona}</p>
          </div>
          <Image
            src={IDENTIDADE_PLANO[plan.id].pet.src}
            alt={IDENTIDADE_PLANO[plan.id].pet.alt}
            width={520}
            height={520}
            sizes="150px"
            className="pointer-events-none absolute -bottom-1 right-0 h-auto w-[44%] max-w-[150px]"
          />
        </div>
      </header>

      <div className="border-y border-neutral-200 py-3 text-center md:text-left">
        <p className="text-3xl font-extrabold text-neutral-900">
          R$ {plan.priceMonthly.toFixed(2).replace('.', ',')}
          <span className="text-sm font-medium text-neutral-500">/mês</span>
        </p>
        <p className="text-xs text-neutral-500">
          {plan.waitingDays !== null
            ? `Carência: ${plan.waitingDays} dias`
            : 'Consulta liberada desde o 1º dia'}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {plan.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white" aria-hidden="true"><Check className="h-3 w-3" strokeWidth={3.4} /></span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleClick}
        className={cn('jofi-btn mt-2 w-full text-center', buttonClass)}
        aria-label={`Quero o ${plan.name} — falar com nosso time`}
      >
        Quero o {plan.name} →
      </button>
    </motion.article>
  );
}
