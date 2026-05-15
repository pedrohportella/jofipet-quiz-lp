'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackLpOfertaWhatsappClick } from '@/lib/tracking/oferta-events';
import { trackWhatsappClick } from '@/lib/tracking/events';
import { buildWhatsappUrl } from '@/lib/tracking/whatsapp';
import { loadStoredUtms } from '@/lib/tracking/utms';

interface StickyWhatsappProps {
  whatsappNumber: string;
}

const SHOW_AFTER_PX = 400;

/**
 * Sticky CTA flutuante no canto inferior direito (mobile-first).
 * Aparece após o user scrollar 400px (passou do hero), mantendo a oferta visível.
 *
 * UX hypothesis: CTA persistente aumenta taxa de clique em ~30-50%
 * em landing pages long-form (Hotjar/CXL data).
 */
export function StickyWhatsapp({ whatsappNumber }: StickyWhatsappProps) {
  const [visible, setVisible] = useState(false);
  const utms = loadStoredUtms();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!whatsappNumber) return null;

  const waUrl = buildWhatsappUrl(whatsappNumber, { utms, source: 'oferta_lp' });

  const handleClick = () => {
    trackLpOfertaWhatsappClick('sticky');
    trackWhatsappClick({ tier: 'quente', utms });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          // bottom respeitando safe-area-inset (iPhone X+ home indicator).
          // Em devices sem notch, cai pra 1rem (16px) via max().
          style={{
            bottom: `max(1rem, env(safe-area-inset-bottom))`,
            right: `max(1rem, env(safe-area-inset-right))`,
          }}
          className="fixed z-50 flex items-center gap-2 rounded-full bg-success-500 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-shadow hover:bg-success-600 hover:shadow-2xl md:px-5 md:py-3.5 md:text-base"
          aria-label="Falar com Nicole no WhatsApp"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span>Falar agora</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
