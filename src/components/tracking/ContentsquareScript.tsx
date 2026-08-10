'use client';

import Script from 'next/script';

interface ContentsquareScriptProps {
  tagId: string;
}

/**
 * Tag do Contentsquare (uxa) — heatmaps, session replay e análise de jornada.
 * Renderizada apenas na LP /oferta; o tag ID é público (exposto no bundle).
 *
 * `afterInteractive` reproduz o `defer` do snippet oficial sem bloquear o LCP.
 */
export function ContentsquareScript({ tagId }: ContentsquareScriptProps) {
  return (
    <Script
      id="contentsquare"
      src={`https://t.contentsquare.net/uxa/${tagId}.js`}
      strategy="afterInteractive"
    />
  );
}
