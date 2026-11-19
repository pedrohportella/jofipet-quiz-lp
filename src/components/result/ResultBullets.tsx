'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ResultBulletsProps {
  bullets: string[];
}

export function ResultBullets({ bullets }: ResultBulletsProps) {
  return (
    <ul className="flex flex-col gap-3 text-left">
      {bullets.map((b, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.08, duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-start gap-3 rounded-[28px] border border-neutral-300 bg-white px-4 py-3.5 text-base font-medium text-neutral-900"
        >
          {/* Item de lista do DS: bola laranja com ícone branco */}
          <span
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white"
            aria-hidden="true"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3.2} />
          </span>
          <span>{b}</span>
        </motion.li>
      ))}
    </ul>
  );
}
