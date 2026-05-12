import type { Transition } from 'framer-motion';

export const springs = {
  snappy: { type: 'spring', stiffness: 500, damping: 40, mass: 0.6 },
  gentle: { type: 'spring', stiffness: 260, damping: 26, mass: 1 },
  bouncy: { type: 'spring', stiffness: 400, damping: 18, mass: 1 },
  soft: { type: 'spring', stiffness: 180, damping: 30, mass: 1.2 },
} as const satisfies Record<string, Transition>;

export const durations = {
  instant: 0.08,
  fast: 0.15,
  base: 0.28,
  slow: 0.48,
} as const;

export const easings = {
  out: [0.4, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  spring: [0.34, 1.4, 0.64, 1],
} as const;

export const stagger = {
  tight: 0.06,
  normal: 0.08,
  loose: 0.12,
} as const;

export type Tier = 'hot' | 'warm' | 'cold';

export const tierSpring: Record<Tier, Transition> = {
  hot: springs.bouncy,
  warm: springs.gentle,
  cold: springs.soft,
};
