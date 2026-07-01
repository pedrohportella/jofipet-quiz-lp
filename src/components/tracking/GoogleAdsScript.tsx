'use client';

import Script from 'next/script';

interface GoogleAdsScriptProps {
  adsId: string;
}

/**
 * Injeta gtag.js do Google Ads (AW-*).
 * Renderizado no layout raiz somente quando NEXT_PUBLIC_GOOGLE_ADS_ID está setado.
 *
 * Usa `next/script` afterInteractive pra não bloquear o LCP.
 * Coexiste com GA4 (next/third-parties) — cada um roda seu próprio config.
 */
export function GoogleAdsScript({ adsId }: GoogleAdsScriptProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${adsId}');
        `}
      </Script>
    </>
  );
}
