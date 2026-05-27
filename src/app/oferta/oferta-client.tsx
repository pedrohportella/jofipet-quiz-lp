'use client';

import { useEffect, useRef } from 'react';
import { Hero } from '@/components/oferta/Hero';
import { HiddenCost } from '@/components/oferta/HiddenCost';
import { Problem } from '@/components/oferta/Problem';
import { Solution } from '@/components/oferta/Solution';
import { HowItWorks } from '@/components/oferta/HowItWorks';
import { VideoSection } from '@/components/oferta/VideoSection';
import { PlanComparison } from '@/components/oferta/PlanComparison';
import { TransparencyTable } from '@/components/oferta/TransparencyTable';
import { Testimonials } from '@/components/oferta/Testimonials';
import { MidCta } from '@/components/oferta/MidCta';
import { Guarantee } from '@/components/oferta/Guarantee';
import { FAQ } from '@/components/oferta/FAQ';
import { FinalCta } from '@/components/oferta/FinalCta';
import { OfertaFooter } from '@/components/oferta/Footer';
import { StickyWhatsapp } from '@/components/oferta/StickyWhatsapp';
import { OfertaCaptureProvider } from '@/components/oferta/OfertaCaptureContext';
import {
  trackLpOfertaScroll,
  trackLpOfertaView,
} from '@/lib/tracking/oferta-events';

interface OfertaClientProps {
  /** URL embed do vídeo institucional (opcional, mostra placeholder se vazio) */
  videoEmbedUrl?: string;
}

/**
 * Orquestrador da LP /oferta.
 *
 * Wraps tudo em <OfertaCaptureProvider> pra que cada CTA WhatsApp/plano
 * abra o popup de captura em vez de WhatsApp direto. Lead vai pro RD/CAPI/
 * Admin antes de virar conversa.
 *
 * Tracking:
 *   - lp_oferta_view ao mount
 *   - lp_oferta_scroll em 25/50/75/100% (debounce)
 */
export function OfertaClient({ videoEmbedUrl }: OfertaClientProps) {
  const milestonesFired = useRef<Set<25 | 50 | 75 | 100>>(new Set());

  useEffect(() => {
    trackLpOfertaView();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollPercent = Math.min(
        100,
        Math.round(
          ((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100,
        ),
      );
      const milestones: Array<25 | 50 | 75 | 100> = [25, 50, 75, 100];
      for (const m of milestones) {
        if (scrollPercent >= m && !milestonesFired.current.has(m)) {
          milestonesFired.current.add(m);
          trackLpOfertaScroll(m);
        }
      }
    };

    let timer: ReturnType<typeof setTimeout> | null = null;
    const throttled = () => {
      if (timer) return;
      timer = setTimeout(() => {
        onScroll();
        timer = null;
      }, 250);
    };

    window.addEventListener('scroll', throttled, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', throttled);
  }, []);

  return (
    <OfertaCaptureProvider>
      <Hero />
      <HiddenCost />
      <Problem />
      <Solution />
      <HowItWorks />
      <VideoSection videoEmbedUrl={videoEmbedUrl} />
      <PlanComparison />
      <TransparencyTable />
      <Testimonials />
      <MidCta />
      <Guarantee />
      <FAQ />
      <FinalCta />
      <OfertaFooter />
      <StickyWhatsapp />
    </OfertaCaptureProvider>
  );
}
