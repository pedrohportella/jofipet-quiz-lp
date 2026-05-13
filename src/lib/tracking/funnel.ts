import type { Tier } from '@/lib/quiz/types';

interface FunnelEventInput {
  type:
    | 'quiz_started'
    | 'quiz_step_view'
    | 'quiz_complete'
    | 'captura_view'
    | 'result_view'
    | 'cta_click';
  tier?: Tier;
  step?: number;
  utmSource?: string;
  payload?: Record<string, unknown>;
}

/**
 * Fire-and-forget event recorder. Posts to /api/funnel-events.
 * Failures are silenced — tracking must never break UX.
 */
export function postFunnelEvent(event: FunnelEventInput): void {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/funnel-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {
      // silent — tracking should never break UX
    });
  } catch {
    // silent
  }
}
