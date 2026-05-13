'use client';

import { motion } from 'framer-motion';

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
          className="flex items-start gap-3 rounded-lg bg-cream px-4 py-3 text-base text-neutral-900"
        >
          <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span>{b}</span>
        </motion.li>
      ))}
    </ul>
  );
}
