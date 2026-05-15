import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Admin-only diagnostic: reporta status das env vars NEXT_PUBLIC_* e
 * principais SERVER-ONLY que afetam o funil.
 *
 * GET /api/admin/env-check
 *
 * Útil pra debug "por que esse comportamento muda?":
 *   - `NEXT_PUBLIC_JOFI_WHATSAPP` vazio? → captura cai no fallback /resultado
 *   - `META_CAPI_ACCESS_TOKEN` ausente? → CAPI server-side faz skip gracioso
 *   - `RD_STATION_PUBLIC_TOKEN` ausente? → leads não chegam no RD
 *
 * Apenas reporta presença/ausência (e preview do valor, com mask em segredos).
 * NÃO loga valores completos pra evitar vazamento via logs Vercel.
 */
export async function GET() {
  // Helper: mascara segredos mostrando só primeiros e últimos chars
  const mask = (v: string | undefined): string => {
    if (!v) return '<empty>';
    if (v.length < 12) return '<too short>';
    return `${v.slice(0, 6)}...${v.slice(-4)} (${v.length} chars)`;
  };

  const publicVars = {
    NEXT_PUBLIC_JOFI_WHATSAPP: process.env.NEXT_PUBLIC_JOFI_WHATSAPP ?? '<empty>',
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '<empty>',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID ?? '<empty>',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? '<empty>',
    NEXT_PUBLIC_SERENINHO_CHECKOUT_URL:
      process.env.NEXT_PUBLIC_SERENINHO_CHECKOUT_URL ?? '<empty>',
    NEXT_PUBLIC_JOFI_VIDEO_URL: process.env.NEXT_PUBLIC_JOFI_VIDEO_URL ?? '<empty>',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY:
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '<empty>',
  };

  const serverVars = {
    META_CAPI_ACCESS_TOKEN: mask(process.env.META_CAPI_ACCESS_TOKEN),
    META_CAPI_TEST_EVENT_CODE:
      process.env.META_CAPI_TEST_EVENT_CODE ?? '<empty>',
    RD_STATION_PUBLIC_TOKEN: mask(process.env.RD_STATION_PUBLIC_TOKEN),
    TURNSTILE_SECRET_KEY: mask(process.env.TURNSTILE_SECRET_KEY),
    HMAC_SECRET: mask(process.env.HMAC_SECRET),
    CRON_SECRET: mask(process.env.CRON_SECRET),
    ADMIN_USER: process.env.ADMIN_USER ?? '<empty>',
    ADMIN_PASSWORD: mask(process.env.ADMIN_PASSWORD),
    ADMIN_PANEL_ENABLED: process.env.ADMIN_PANEL_ENABLED ?? '<empty>',
    KV_REST_API_URL: process.env.KV_REST_API_URL ? '<set>' : '<empty>',
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '<set>' : '<empty>',
  };

  // Diagnóstico rápido: quais issues conhecidos a config atual tem?
  const issues: string[] = [];
  if (publicVars.NEXT_PUBLIC_JOFI_WHATSAPP === '<empty>') {
    issues.push(
      'NEXT_PUBLIC_JOFI_WHATSAPP vazio → captura cai no fallback /resultado, sem redirect WhatsApp',
    );
  }
  if (
    publicVars.NEXT_PUBLIC_META_PIXEL_ID === '<empty>' ||
    publicVars.NEXT_PUBLIC_META_PIXEL_ID === '000000000000000'
  ) {
    issues.push('NEXT_PUBLIC_META_PIXEL_ID vazio ou placeholder → Pixel não dispara');
  }
  if (serverVars.META_CAPI_ACCESS_TOKEN === '<empty>') {
    issues.push('META_CAPI_ACCESS_TOKEN vazio → CAPI server-side faz skip');
  }
  if (serverVars.RD_STATION_PUBLIC_TOKEN === '<empty>') {
    issues.push('RD_STATION_PUBLIC_TOKEN vazio → leads não vão pro RD');
  }
  if (serverVars.KV_REST_API_URL === '<empty>') {
    issues.push('KV não configurado → leads ficam só em memória (cold start zera)');
  }

  return NextResponse.json(
    {
      public: publicVars,
      server: serverVars,
      issues: issues.length > 0 ? issues : ['nenhum issue detectado'],
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV ?? '<not on vercel>',
    },
    { status: 200 },
  );
}
