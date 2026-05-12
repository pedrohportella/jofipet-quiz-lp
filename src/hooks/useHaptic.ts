'use client';

type HapticIntensity = 'light' | 'medium' | 'heavy';

const PATTERNS: Record<HapticIntensity, number> = {
  light: 10,
  medium: 20,
  heavy: 40,
};

export function useHaptic() {
  return (intensity: HapticIntensity = 'light') => {
    if (typeof window === 'undefined') return;
    if (typeof navigator === 'undefined') return;
    if (!('vibrate' in navigator)) return;
    try {
      navigator.vibrate(PATTERNS[intensity]);
    } catch {
      // Silently ignore — haptics are a progressive enhancement
    }
  };
}
