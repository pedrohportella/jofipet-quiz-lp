import type { Variants } from 'framer-motion';
import { springs, durations, easings, stagger } from './springs';

export const heroContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.normal,
      delayChildren: 0.06,
    },
  },
};

export const heroChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
};

export const heroEmoji: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: durations.base, ease: easings.out },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: springs.gentle,
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
};

export const slideStep: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 320, damping: 30, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    x: -24,
    transition: { duration: durations.fast, ease: easings.in },
  },
};

export const tierReveal: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.gentle,
  },
};

export const benefitsList: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger.loose,
      delayChildren: 0.4,
    },
  },
};

export const shake: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.32, ease: easings.out },
  },
};

export const optionPulse: Variants = {
  idle: { scale: 1 },
  selected: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.2, times: [0, 0.5, 1], ease: easings.out },
  },
};

export const progressFill: Variants = {
  hidden: { scaleX: 0 },
  show: (percent: number) => ({
    scaleX: percent / 100,
    transition: { duration: durations.slow, ease: easings.out },
  }),
};
