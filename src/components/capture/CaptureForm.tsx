'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormMask } from 'use-mask-input';
import {
  CaptureFormSchema,
  type CaptureFormValues,
  type LeadPayload,
} from '@/lib/validation/schemas';
import { useQuizState } from '@/hooks/useQuizState';
import { loadStoredUtms } from '@/lib/tracking/utms';
import { trackLead } from '@/lib/tracking/events';
import { LgpdConsent } from './LgpdConsent';

export function CaptureForm() {
  const router = useRouter();
  const { state, hydrated, dispatch } = useQuizState();
  const [submitState, setSubmitState] = useState<{
    status: 'idle' | 'submitting' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CaptureFormValues>({
    resolver: zodResolver(CaptureFormSchema),
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

  useEffect(() => {
    if (!hydrated) return;
    if (!state.tier || !state.finishedAt) {
      router.replace('/');
    }
  }, [hydrated, state.tier, state.finishedAt, router]);

  if (!hydrated || !state.tier) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-mobile items-center justify-center px-4">
        <p className="text-sm text-neutral-500">Carregando…</p>
      </div>
    );
  }

  const onSubmit = async (values: CaptureFormValues) => {
    setSubmitState({ status: 'submitting' });

    const utms = loadStoredUtms();

    const payload: LeadPayload = {
      name: values.name.trim(),
      whatsapp: values.whatsapp,
      email: values.email && values.email.length > 0 ? values.email : undefined,
      consent: true,
      tier: state.tier!,
      score: state.score ?? 0,
      breakdown: state.breakdown ?? {
        pet_ativo: 0,
        gasto: 0,
        dor: 0,
        cobertura: 0,
      },
      answers: state.answers as LeadPayload['answers'],
      utms: Object.keys(utms).length > 0 ? utms : undefined,
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.reason ?? `HTTP ${response.status}`);
      }

      const responseBody = await response.json().catch(() => null);
      const leadId = responseBody?.leadId ?? `lead_${Date.now()}`;
      dispatch({
        type: 'CAPTURE_LEAD',
        name: payload.name,
        leadId,
      });
      // Passa leadId como eventID — server-side CAPI usa o mesmo leadId,
      // garantindo dedup automático no Meta Events Manager.
      trackLead({
        tier: state.tier!,
        hasEmail: !!payload.email,
        eventID: leadId,
      });
      router.push(`/resultado/${state.tier}`);
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-neutral-900">
          Como podemos te chamar?
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Seu nome"
          {...register('name')}
          aria-invalid={!!errors.name}
          className="h-13 rounded-md border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ height: 52 }}
        />
        {errors.name && (
          <p className="text-sm font-medium text-accent-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="whatsapp" className="text-sm font-semibold text-neutral-900">
          WhatsApp
        </label>
        <input
          id="whatsapp"
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-neutral-900">
          Email <span className="font-normal text-neutral-500">(opcional)</span>
        </label>
        <input
          id="email"
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
            id="consent"
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

      {/* Sticky CTA no mobile: garante que o botão fique sempre visível mesmo
          quando o consent LGPD empurra o form pra baixo. No desktop, comportamento normal. */}
      <div className="sticky bottom-0 -mx-4 mt-2 flex flex-col gap-2 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] md:static md:mx-0 md:mt-2 md:gap-2 md:bg-transparent md:p-0 md:shadow-none">
        <button
          type="submit"
          disabled={isSubmitting || submitState.status === 'submitting'}
          className="jofi-btn jofi-btn--primary w-full"
        >
          {isSubmitting || submitState.status === 'submitting' ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              Liberando seu plano…
            </span>
          ) : (
            'Ver meu plano ideal →'
          )}
        </button>
        <p className="text-center text-xs text-neutral-500">
          🔒 Seus dados ficam protegidos · Só te chamamos sobre o resultado
        </p>
      </div>
    </form>
  );
}
