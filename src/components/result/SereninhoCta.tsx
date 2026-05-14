'use client';

import { loadStoredUtms } from '@/lib/tracking/utms';
import { trackInitiateCheckout, trackSereninhoClick } from '@/lib/tracking/events';
import { useQuizState } from '@/hooks/useQuizState';

interface SereninhoCtaProps {
  baseUrl: string;
}

function appendUtms(baseUrl: string, utms: ReturnType<typeof loadStoredUtms>): string {
  try {
    const url = new URL(baseUrl);
    for (const [k, v] of Object.entries(utms)) {
      if (typeof v === 'string' && v.length > 0 && !url.searchParams.has(k)) {
        url.searchParams.set(k, v);
      }
    }
    if (!url.searchParams.has('utm_content')) {
      url.searchParams.set('utm_content', 'quiz-morno');
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function SereninhoCta({ baseUrl }: SereninhoCtaProps) {
  const { state } = useQuizState();

  if (!baseUrl) {
    return (
      <div className="rounded-lg bg-cream px-4 py-3 text-sm text-neutral-700">
        Checkout em configuração — em breve.
      </div>
    );
  }

  const utms = loadStoredUtms();
  const finalUrl = appendUtms(baseUrl, utms);

  const handleClick = () => {
    // context: 'sereninho_click' → eventID = ${leadId}_ic_sereninho_click
    // diferente do mount (context: 'view') pra não dedupar com o evento de pageview.
    trackInitiateCheckout({
      tier: 'morno',
      value: 49.9,
      leadId: state.leadId ?? undefined,
      context: 'sereninho_click',
    });
    trackSereninhoClick({ utms });
  };

  return (
    <a
      href={finalUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="jofi-btn jofi-btn--accent w-full"
    >
      Conhecer o Sereninho · R$ 49,90 →
    </a>
  );
}
