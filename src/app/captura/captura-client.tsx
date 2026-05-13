'use client';

import { useEffect } from 'react';
import { useQuizState } from '@/hooks/useQuizState';
import { CaptureForm } from '@/components/capture/CaptureForm';
import { TierPreview } from '@/components/capture/TierPreview';
import { postFunnelEvent } from '@/lib/tracking/funnel';
import { loadStoredUtms } from '@/lib/tracking/utms';

export function CapturaClient() {
  const { state, hydrated } = useQuizState();

  useEffect(() => {
    if (!hydrated || !state.tier) return;
    const utms = loadStoredUtms();
    postFunnelEvent({
      type: 'captura_view',
      tier: state.tier,
      utmSource: utms.utm_source,
    });
  }, [hydrated, state.tier]);

  return (
    <>
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl" aria-hidden="true">
          🎉
        </span>
        <h1
          className="text-2xl uppercase leading-[0.95] text-neutral-900 md:text-3xl"
          style={{ fontFamily: 'var(--font-anton), Anton, Impact, sans-serif' }}
        >
          Quase lá!
        </h1>
      </header>

      {hydrated && state.tier && <TierPreview tier={state.tier} />}

      <CaptureForm />
    </>
  );
}
