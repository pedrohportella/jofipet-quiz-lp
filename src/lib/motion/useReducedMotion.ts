'use client';

import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';
import type { Transition } from 'framer-motion';

export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}

export const INSTANT_TRANSITION: Transition = { duration: 0.001 };

export function reduceTransition(
  transition: Transition | undefined,
  reduced: boolean,
): Transition | undefined {
  if (!reduced) return transition;
  return INSTANT_TRANSITION;
}
