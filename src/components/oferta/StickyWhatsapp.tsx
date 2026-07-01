'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfertaCapture } from './OfertaCaptureContext';

const SHOW_AFTER_PX = 400;

/**
 * CTA persistente de WhatsApp.
 *   - Mobile: barra full-width fixa no bottom (área grande, sempre no polegar).
 *   - Desktop: botão pill flutuante no canto inferior direito.
 *
 * Dispara `useOfertaCapture().open()` — o modal cuida do conversion Google Ads
 * (fireGoogleAdsConversion) e do redirect pro wa.me com utm+gclid preservados.
 */
export function StickyWhatsapp() {
  const [visible, setVisible] = useState(false);
  const { open } = useOfertaCapture();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    open({ source: 'sticky' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Mobile — barra full-width fixa no bottom */}
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-3 pt-3 shadow-2xl backdrop-blur-sm md:hidden"
            style={{
              paddingBottom: `max(0.75rem, env(safe-area-inset-bottom))`,
            }}
          >
            <button
              type="button"
              onClick={handleClick}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-success-500 px-4 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-success-600"
              aria-label="Falar com nosso time no WhatsApp"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              <span>Falar no WhatsApp</span>
            </button>
          </motion.div>

          {/* Desktop — botão pill flutuante no canto */}
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            type="button"
            onClick={handleClick}
            style={{
              bottom: `max(1rem, env(safe-area-inset-bottom))`,
              right: `max(1rem, env(safe-area-inset-right))`,
            }}
            className="fixed z-40 hidden items-center gap-2 rounded-full bg-success-500 px-5 py-3.5 text-base font-semibold text-white shadow-xl transition-shadow hover:bg-success-600 hover:shadow-2xl md:flex"
            aria-label="Falar com nosso time no WhatsApp"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <span>Falar agora</span>
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}
