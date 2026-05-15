'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';
import { loadStoredUtms } from '@/lib/tracking/utms';
import {
  trackWhatsappClick,
  trackInitiateCheckout,
} from '@/lib/tracking/events';
import { gaEvent } from '@/lib/tracking/ga4';
import type { Answers, Tier } from '@/lib/quiz/types';

const COUNTDOWN_SECONDS = 7;

interface WhatsappAutoRedirectProps {
  tier: Tier;
  leadId: string | null;
  leadName: string | null;
  answers: Answers;
  phoneNumber: string;
}

const TIER_VALUE: Record<Tier, number> = {
  quente: 89.9,
  morno: 49.9,
  frio: 0,
};

/**
 * Banner de auto-redirect pro WhatsApp na chegada da página de resultado.
 *
 * Aparece SÓ em tiers quente e morno (frio mantém educacional).
 * Countdown 7s; pode ser cancelado ou antecipado.
 *
 * Fluxo:
 *   1. Mount: começa countdown de 7s
 *   2. Cada segundo: decrementa, atualiza UI
 *   3. Lead "Cancelar": esconde banner, fica na página (state cancelled)
 *   4. Lead "Falar agora": dispara tracking + redirect imediato
 *   5. Timeout 0s: dispara tracking + redirect automático
 *
 * Tracking:
 *   - GA: wa_auto_redirect_fired (timeout) / wa_auto_redirect_cancelled / wa_auto_redirect_manual
 *   - Pixel/CAPI: trackWhatsappClick + trackInitiateCheckout(context='wa_click')
 *     Mesmo eventID que o botão WhatsappCta padrão = Meta dedup automático.
 */
export function WhatsappAutoRedirect({
  tier,
  leadId,
  leadName,
  answers,
  phoneNumber,
}: WhatsappAutoRedirectProps) {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [cancelled, setCancelled] = useState(false);

  // Tier frio nunca auto-redireciona. Cold é educacional.
  // Phone ausente: não renderiza nada.
  const enabled = tier !== 'frio' && Boolean(phoneNumber);

  useEffect(() => {
    if (!enabled || cancelled) return;

    if (seconds <= 0) {
      // Tracking — auto-redirect firing
      gaEvent('wa_auto_redirect_fired', { tier });
      trackWhatsappClick({ tier, utms: loadStoredUtms() });
      trackInitiateCheckout({
        tier,
        value: TIER_VALUE[tier],
        leadId: leadId ?? undefined,
        context: 'wa_click',
      });

      // Redirect (mesma aba — WhatsApp app intercepta em mobile, navega em desktop)
      window.location.href = buildUrl();
      return;
    }

    const timer = window.setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, cancelled, enabled]);

  if (!enabled) return null;

  const buildUrl = () => {
    const utms = loadStoredUtms();
    const gasto = answers['gasto-mensal'];
    const ultimaVet = answers['ultima-vet'];

    return buildWhatsappUrl(phoneNumber, {
      tier,
      especie: String(answers['especie'] ?? ''),
      idade: String(answers['idade'] ?? ''),
      utms,
      leadName,
      gastoMensal: typeof gasto === 'number' ? gasto : null,
      ultimaVet: typeof ultimaVet === 'string' ? ultimaVet : null,
    });
  };

  const handleCancel = () => {
    gaEvent('wa_auto_redirect_cancelled', { tier, seconds_left: seconds });
    setCancelled(true);
  };

  const handleManualClick = () => {
    gaEvent('wa_auto_redirect_manual', { tier, seconds_left: seconds });
    trackWhatsappClick({ tier, utms: loadStoredUtms() });
    trackInitiateCheckout({
      tier,
      value: TIER_VALUE[tier],
      leadId: leadId ?? undefined,
      context: 'wa_click',
    });
    // Browser navigation por <a href> com keepalive das requisições
  };

  return (
    <AnimatePresence>
      {!cancelled && (
        <motion.aside
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md rounded-2xl border-2 border-success-500 bg-success-50 p-4 text-left shadow-md"
          aria-live="polite"
          aria-label="Redirecionamento para WhatsApp"
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="text-2xl" aria-hidden="true">
              👋
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold leading-tight text-success-700">
                A Nicole tá te esperando no WhatsApp
              </p>
              <p className="mt-0.5 text-xs text-success-700">
                Te conectando em{' '}
                <strong className="text-base tabular-nums">{seconds}s</strong>
                {' '}— você pode cancelar a qualquer momento.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={buildUrl()}
              onClick={handleManualClick}
              className="jofi-btn jofi-btn--whatsapp flex-1 text-sm"
            >
              Falar agora →
            </a>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Cancelar
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
