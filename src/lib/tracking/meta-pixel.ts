/* eslint-disable @typescript-eslint/no-explicit-any */
// Meta Pixel wrapper. Casts são necessários porque `window.fbq` é populado
// dinamicamente pelo script inline do pixel.

type FbqFn = ((...args: any[]) => void) & { queue?: unknown[] };

interface WindowWithFbq extends Window {
  fbq?: FbqFn;
  _fbq?: FbqFn;
}

export function hasPixel(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as WindowWithFbq).fbq === 'function';
}

export function fbqTrack(
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
): void {
  try {
    if (!hasPixel()) return;
    const fbq = (window as WindowWithFbq).fbq!;
    // Meta Pixel signature: fbq('track', 'EventName', params, { eventID })
    // eventID é crítico pra dedup com CAPI server-side (mesmo event_id = um evento só).
    if (params && options?.eventID) {
      fbq('track', event, params, { eventID: options.eventID });
    } else if (params) {
      fbq('track', event, params);
    } else {
      fbq('track', event);
    }
  } catch {
    // Silent fallback — tracking never breaks UX
  }
}

export function fbqTrackCustom(
  event: string,
  params?: Record<string, unknown>,
): void {
  try {
    if (!hasPixel()) return;
    const fbq = (window as WindowWithFbq).fbq!;
    if (params) {
      fbq('trackCustom', event, params);
    } else {
      fbq('trackCustom', event);
    }
  } catch {
    // Silent fallback
  }
}

export const PIXEL_INIT_SCRIPT = (pixelId: string) => `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
`;
