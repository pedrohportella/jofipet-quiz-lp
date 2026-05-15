'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { PLANS, type Plan } from '@/lib/plans/catalog';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';
import { loadStoredUtms } from '@/lib/tracking/utms';
import {
  trackLpOfertaPlanClick,
  trackLpOfertaWhatsappClick,
} from '@/lib/tracking/oferta-events';
import { trackWhatsappClick } from '@/lib/tracking/events';
import { cn } from '@/lib/utils/cn';

interface PlanComparisonProps {
  whatsappNumber: string;
}

/**
 * Tabela visual dos 4 planos Jofi.
 *
 * UX:
 *   - Mobile (1 col): cards empilhados, plano popular destacado
 *   - Desktop (4 cols): grid horizontal, popular tem badge "Mais escolhido"
 *
 * Tracking: cada clique em "Quero esse plano" dispara:
 *   - trackLpOfertaPlanClick(planId, 'card')
 *   - trackWhatsappClick (mantém compat com Pixel/CAPI)
 *   - Redirect pro WhatsApp com mensagem rica mencionando o plano
 */
export function PlanComparison({ whatsappNumber }: PlanComparisonProps) {
  const utms = loadStoredUtms();

  return (
    <section id="planos" className="scroll-mt-20 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 text-center md:mb-14">
          <p className="jofi-kicker mb-2 text-accent">Planos Jofi</p>
          <h2
            className="text-3xl uppercase leading-tight text-neutral-900 md:text-5xl"
            style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
          >
            Escolha o ideal pro
            <br />
            <span className="text-primary">seu pequeno.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-700">
            Todos os planos incluem orientação 24h via WhatsApp e cobertura nacional na rede Jofi.
            Sem fidelidade, sem letra miúda.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              whatsappNumber={whatsappNumber}
              utms={utms}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-neutral-500">
          {/* TODO Pedro/Jofi: validar carências, limites e bullets de cada plano. */}
          ⚠️ Valores e coberturas sujeitos a confirmação Jofi antes da contratação.
        </p>
      </div>
    </section>
  );
}

interface PlanCardProps {
  plan: Plan;
  whatsappNumber: string;
  utms: ReturnType<typeof loadStoredUtms>;
}

function PlanCard({ plan, whatsappNumber, utms }: PlanCardProps) {
  const waUrl = whatsappNumber
    ? buildWhatsappUrl(whatsappNumber, {
        utms,
        selectedPlanId: plan.id,
        source: 'oferta_lp',
      })
    : '#';

  const handleClick = () => {
    trackLpOfertaPlanClick(plan.id, 'card');
    trackLpOfertaWhatsappClick('mid'); // CTA da seção de planos = "mid"
    if (whatsappNumber) {
      trackWhatsappClick({ tier: 'quente', utms });
    }
  };

  const accentClass = {
    primary: 'border-primary',
    accent: 'border-accent ring-2 ring-accent/20',
    success: 'border-success-500',
    neutral: 'border-neutral-300',
  }[plan.accentColor];

  const buttonClass = {
    primary: 'jofi-btn--primary',
    accent: 'jofi-btn--accent',
    success: 'jofi-btn--whatsapp',
    neutral: 'jofi-btn--ghost border border-neutral-300',
  }[plan.accentColor];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4 }}
      className={cn(
        // pt-7 mobile pra dar espaço pro badge "Mais escolhido" sem quebrar
        // o conteúdo. Em desktop volta pro p-6 normal.
        'relative flex flex-col gap-4 rounded-2xl border-2 bg-white p-5 pt-7 transition-shadow hover:shadow-lg md:p-6 md:pt-7',
        accentClass,
      )}
    >
      {plan.popular && (
        // whitespace-nowrap garante que badge não quebre em 2 linhas
        // max-w + truncate como fallback se viewport for absurdamente pequeno
        <div className="absolute -top-3 left-1/2 max-w-[90%] -translate-x-1/2 truncate whitespace-nowrap rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm md:text-xs">
          ⭐ Mais escolhido
        </div>
      )}

      <header className="flex flex-col items-start gap-1 pt-2">
        <span className="text-3xl" aria-hidden="true">
          {plan.emoji}
        </span>
        <p className="jofi-kicker text-neutral-500">{plan.tagline}</p>
        <h3
          className="text-2xl uppercase leading-none text-neutral-900"
          style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
        >
          {plan.name}
        </h3>
        <p className="text-xs text-neutral-500">{plan.targetPersona}</p>
      </header>

      <div className="border-y border-neutral-200 py-3">
        <p className="text-3xl font-extrabold text-neutral-900">
          R$ {plan.priceMonthly.toFixed(2).replace('.', ',')}
          <span className="text-sm font-medium text-neutral-500">/mês</span>
        </p>
        <p className="text-xs text-neutral-500">
          Carência: {plan.waitingDays} dias · sem fidelidade
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {plan.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" strokeWidth={3} />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn('jofi-btn mt-2 w-full text-center', buttonClass)}
        aria-label={`Quero o Plano ${plan.name} — falar com nosso time`}
      >
        Quero o {plan.name} →
      </a>
    </motion.article>
  );
}
