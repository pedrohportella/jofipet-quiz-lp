'use client';

import { useEffect, useRef } from 'react';
import { Hero } from '@/components/oferta/Hero';
import { Problem } from '@/components/oferta/Problem';
import { Solution } from '@/components/oferta/Solution';
import { VideoSection } from '@/components/oferta/VideoSection';
import { PlanComparison } from '@/components/oferta/PlanComparison';
import { Testimonials } from '@/components/oferta/Testimonials';
import { MidCta } from '@/components/oferta/MidCta';
import { Guarantee } from '@/components/oferta/Guarantee';
import { FAQ } from '@/components/oferta/FAQ';
import { FinalCta } from '@/components/oferta/FinalCta';
import { OfertaFooter } from '@/components/oferta/Footer';
import { StickyWhatsapp } from '@/components/oferta/StickyWhatsapp';
import {
  trackLpOfertaScroll,
  trackLpOfertaView,
} from '@/lib/tracking/oferta-events';

interface OfertaClientProps {
  whatsappNumber: string;
  /** URL embed do vídeo institucional (opcional, mostra placeholder se vazio) */
  videoEmbedUrl?: string;
}

/**
 * Orquestrador da LP /oferta. Compõe todas as seções + tracking global.
 *
 * Tracking:
 *   - lp_oferta_view ao mount
 *   - lp_oferta_scroll em 25/50/75/100% (debounce)
 */
export function OfertaClient({ whatsappNumber, videoEmbedUrl }: OfertaClientProps) {
  const milestonesFired = useRef<Set<25 | 50 | 75 | 100>>(new Set());

  // Mount tracking — disparado uma vez na primeira renderização client
  useEffect(() => {
    trackLpOfertaView();
  }, []);

  // Scroll depth tracking — milestones em 25/50/75/100%
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
    onScroll(); // init
    return () => window.removeEventListener('scroll', throttled);
  }, []);

  return (
    <>
      <Hero whatsappNumber={whatsappNumber} />
      <Problem />
      <Solution />
      <VideoSection videoEmbedUrl={videoEmbedUrl} />
      <PlanComparison whatsappNumber={whatsappNumber} />
      <Testimonials />
      <MidCta whatsappNumber={whatsappNumber} />
      <Guarantee />
      <FAQ />
      <FinalCta whatsappNumber={whatsappNumber} />
      <OfertaFooter />
      <StickyWhatsapp whatsappNumber={whatsappNumber} />
    </>
  );
}
