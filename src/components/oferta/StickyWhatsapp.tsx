'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfertaCapture } from './OfertaCaptureContext';

const SHOW_AFTER_PX = 400;

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
          className="fixed z-40 flex items-center gap-2 rounded-full bg-success-500 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-shadow hover:bg-success-600 hover:shadow-2xl md:px-5 md:py-3.5 md:text-base"
          aria-label="Falar com nosso time no WhatsApp"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span>Falar agora</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
