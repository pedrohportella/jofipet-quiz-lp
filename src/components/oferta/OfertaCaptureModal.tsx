'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormMask } from 'use-mask-input';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LgpdConsent } from '@/components/capture/LgpdConsent';
import { loadStoredUtms } from '@/lib/tracking/utms';
import { loadStoredGoogleClickIds } from '@/lib/tracking/gclid';
import { fireGoogleAdsConversion } from '@/lib/tracking/google-ads';
import {
  trackLead,
  trackInitiateCheckout,
  trackWhatsappClick,
} from '@/lib/tracking/events';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';
import {
  trackLpOfertaPlanClick,
  trackLpOfertaWhatsappClick,
} from '@/lib/tracking/oferta-events';
import { getPlanById, type PlanId } from '@/lib/plans/catalog';
import type { Tier } from '@/lib/quiz/types';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_JOFI_WHATSAPP ?? '';
const REDIRECT_DELAY_MS = 2000;

const PLAN_TO_TIER: Record<PlanId, Tier> = {
  sereninho: 'frio',
  sereno: 'morno',
  parceiro: 'quente',
  'melhor-amigo': 'quente',
};
const TIER_VALUE: Record<Tier, number> = {
  quente: 89.9,
  morno: 49.9,
  frio: 0,
};

const ModalSchema = z.object({
  name: z
    .string()
    .min(2, 'Conta o nome inteiro 🐾')
    .max(80, 'Nome muito longo')
    .regex(/^[\p{L}\s'-]{2,80}$/u, 'Só letras, espaço, hífen e apóstrofo'),
  email: z
    .string()
    .email('Ops, esse email não parece válido')
    .or(z.literal(''))
    .optional(),
  whatsapp: z
    .string()
    .regex(/^\(\d{2}\)\s?9?\d{4}-\d{4}$/, 'Ops, o WhatsApp parece incompleto 🐾'),
  // Pattern z.boolean().refine — permite defaultValues { consent: false }
  // sem quebrar tipo do react-hook-form (igual ao CaptureFormSchema).
  consent: z.boolean().refine((v) => v === true, {
    message: 'Precisamos do consentimento pra te contatar 💛',
  }),
});

type ModalValues = z.infer<typeof ModalSchema>;

export interface OfertaCaptureContext {
  /** Plano clicado (vem dos PlanCards). Undefined em CTAs genéricos. */
  selectedPlanId?: PlanId;
  /** Posição do CTA na página (pra tracking). */
  source: 'hero' | 'mid' | 'final' | 'sticky' | 'card' | 'hidden_cost';
}

interface OfertaCaptureModalProps {
  /** Quando context é null, modal fica fechado. */
  context: OfertaCaptureContext | null;
  onClose: () => void;
}

/**
 * Modal de captura da LP /oferta.
 *
 * Aparece ao clicar em qualquer CTA WhatsApp/plano da LP. Captura
 * nome+email+whatsapp+LGPD e:
 *   1. POST /api/leads/oferta → RD Station + Vercel KV + Meta CAPI Lead
 *   2. Dispara Pixel client (trackLead + trackInitiateCheckout)
 *   3. Mostra overlay 2s + redirect WhatsApp com mensagem rica
 *
 * Fechamento: Escape, click fora do card, ou X button.
 * Lead que abandona o modal: nada captura (UX limpa).
 */
export function OfertaCaptureModal({
  context,
  onClose,
}: OfertaCaptureModalProps) {
  const [submitState, setSubmitState] = useState<{
    status: 'idle' | 'submitting' | 'redirecting' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ModalValues>({
    resolver: zodResolver(ModalSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      consent: false,
    },
  });

  const registerWithMask = useHookFormMask(register);

  // Reset state ao abrir
  useEffect(() => {
    if (context) {
      setSubmitState({ status: 'idle' });
      reset();
    }
  }, [context, reset]);

  // Escape pra fechar
  useEffect(() => {
    if (!context) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && submitState.status !== 'redirecting') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    // Trava scroll body enquanto modal aberto
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [context, onClose, submitState.status]);

  if (!context) return null;

  const plan = context.selectedPlanId
    ? getPlanById(context.selectedPlanId)
    : null;
  const tier: Tier = context.selectedPlanId
    ? PLAN_TO_TIER[context.selectedPlanId]
    : 'morno';

  const onSubmit = async (values: ModalValues) => {
    setSubmitState({ status: 'submitting' });
    const utms = loadStoredUtms();
    const googleClickIds = loadStoredGoogleClickIds();

    try {
      const response = await fetch('/api/leads/oferta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          whatsapp: values.whatsapp,
          email: values.email && values.email.length > 0 ? values.email : undefined,
          consent: true,
          selectedPlanId: context.selectedPlanId,
          source: context.source,
          utms: Object.keys(utms).length > 0 ? utms : undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.reason ?? `HTTP ${response.status}`);
      }

      const body = await response.json().catch(() => null);
      const leadId = body?.leadId ?? `lead_${Date.now()}`;

      // Tracking — Pixel + CAPI (CAPI já dispara em /api/leads/oferta)
      trackLead({
        tier,
        hasEmail: !!values.email,
        eventID: leadId,
      });
      trackInitiateCheckout({
        tier,
        value: TIER_VALUE[tier],
        leadId,
        context: 'wa_click',
      });
      trackWhatsappClick({ tier, utms });
      if (context.selectedPlanId) {
        trackLpOfertaPlanClick(context.selectedPlanId, 'card');
      }
      trackLpOfertaWhatsappClick(
        context.source === 'card' || context.source === 'hidden_cost'
          ? 'mid'
          : context.source,
      );

      // Google Ads conversion — dispara ANTES do redirect pra garantir
      // que o gtag registre o evento mesmo com navegação subsequente.
      fireGoogleAdsConversion({
        value: TIER_VALUE[tier],
        currency: 'BRL',
        transactionId: leadId,
      });

      // Fallback: sem WHATSAPP_NUMBER, só fecha modal (lead já foi salvo)
      if (!WHATSAPP_NUMBER) {
        setSubmitState({ status: 'redirecting' });
        setTimeout(() => {
          onClose();
        }, REDIRECT_DELAY_MS);
        return;
      }

      // Build mensagem rica e redireciona (preservando gclid/gbraid/wbraid)
      const waUrl = buildWhatsappUrl(WHATSAPP_NUMBER, {
        utms,
        googleClickIds,
        leadName: values.name,
        selectedPlanId: context.selectedPlanId,
        source: 'oferta_lp',
      });

      setSubmitState({ status: 'redirecting' });
      setTimeout(() => {
        window.location.href = waUrl;
      }, REDIRECT_DELAY_MS);
    } catch (error) {
      setSubmitState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Algo deu errado. Tenta de novo?',
      });
    }
  };

  // Overlay de redirecionamento (cobre o form)
  if (submitState.status === 'redirecting') {
    return <RedirectingOverlay />;
  }

  // Header dinâmico baseado em qual CTA o lead clicou
  const heading = plan
    ? `Quer saber sobre o ${plan.name}?`
    : 'Vamos conversar?';
  const sub = plan
    ? `Conta seus dados e nosso time te explica tudo sobre o ${plan.name} no WhatsApp.`
    : 'Conta seus dados e nosso time te atende no WhatsApp em minutos.';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="oferta-modal-title"
      >
        <motion.div
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 32, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
          onClick={(e) => e.stopPropagation()}
          style={{ paddingBottom: `max(1.25rem, env(safe-area-inset-bottom))` }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <header className="mb-4 flex flex-col items-center text-center sm:mb-5">
            {plan && (
              <span className="mb-1 text-3xl" aria-hidden="true">
                {plan.emoji}
              </span>
            )}
            <h2
              id="oferta-modal-title"
              className="text-xl font-extrabold leading-tight text-neutral-900 sm:text-2xl"
            >
              {heading}
            </h2>
            <p className="mt-1 text-sm text-neutral-700">{sub}</p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="oferta-name"
                className="text-sm font-semibold text-neutral-900"
              >
                Nome
              </label>
              <input
                id="oferta-name"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                {...register('name')}
                aria-invalid={!!errors.name}
                className="rounded-md border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ height: 52 }}
              />
              {errors.name && (
                <p className="text-sm font-medium text-accent-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="oferta-whatsapp"
                className="text-sm font-semibold text-neutral-900"
              >
                WhatsApp
              </label>
              <input
                id="oferta-whatsapp"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="(00) 00000-0000"
                {...registerWithMask('whatsapp', '(99) 99999-9999')}
                aria-invalid={!!errors.whatsapp}
                className="rounded-md border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ height: 52 }}
              />
              {errors.whatsapp && (
                <p className="text-sm font-medium text-accent-600" role="alert">
                  {errors.whatsapp.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="oferta-email"
                className="text-sm font-semibold text-neutral-900"
              >
                Email <span className="font-normal text-neutral-500">(opcional)</span>
              </label>
              <input
                id="oferta-email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register('email')}
                aria-invalid={!!errors.email}
                className="rounded-md border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ height: 52 }}
              />
              {errors.email && (
                <p className="text-sm font-medium text-accent-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <LgpdConsent
                  id="oferta-consent"
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  error={errors.consent?.message}
                />
              )}
            />

            {submitState.status === 'error' && (
              <p
                className="rounded-md bg-accent-100 px-3 py-2 text-sm text-accent-700"
                role="alert"
              >
                {submitState.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || submitState.status === 'submitting'}
              className="jofi-btn jofi-btn--whatsapp w-full"
            >
              {isSubmitting || submitState.status === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Enviando…
                </span>
              ) : (
                'Continuar no WhatsApp 🐾'
              )}
            </button>

            <p className="text-center text-xs text-neutral-500">
              🔒 Seus dados ficam protegidos · Só te chamamos sobre a cobertura
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function RedirectingOverlay() {
  return (
    <div
      role="alert"
      aria-live="polite"
      aria-label="Redirecionando para WhatsApp"
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        className="mx-4 flex max-w-md flex-col items-center gap-5 rounded-2xl bg-white px-6 py-10 text-center shadow-2xl"
      >
        <motion.span
          aria-hidden="true"
          className="text-6xl"
          animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.4 }}
        >
          🐾
        </motion.span>
        <div className="flex flex-col gap-2">
          <p className="text-xl font-extrabold leading-tight text-neutral-900">
            Te conectando com nosso time…
          </p>
          <p className="text-sm text-neutral-700">
            O WhatsApp vai abrir em segundos 💛
          </p>
        </div>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-neutral-200">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: REDIRECT_DELAY_MS / 1000, ease: 'linear' }}
            className="h-full rounded-full bg-success-500"
          />
        </div>
      </motion.div>
    </div>
  );
}
