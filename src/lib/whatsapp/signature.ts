/**
 * Validação de assinatura X-Hub-Signature-256 dos webhooks Meta.
 *
 * Meta assina o body raw do POST com HMAC SHA-256 + APP_SECRET.
 * Header chega como: "sha256=<hex>"
 *
 * Importante: tem que validar contra o body RAW (string ou Buffer), NÃO
 * contra o JSON re-serializado. Re-serialização muda whitespace e quebra
 * a assinatura.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface VerifyResult {
  ok: boolean;
  reason?: 'missing_header' | 'malformed_header' | 'mismatch';
}

export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  appSecret: string,
): VerifyResult {
  if (!signatureHeader) {
    return { ok: false, reason: 'missing_header' };
  }
  if (!signatureHeader.startsWith('sha256=')) {
    return { ok: false, reason: 'malformed_header' };
  }
  const expected = signatureHeader.slice('sha256='.length);

  const hmac = createHmac('sha256', appSecret);
  hmac.update(rawBody, 'utf8');
  const computed = hmac.digest('hex');

  // Comparação constant-time. Mesmo length é pré-requisito do timingSafeEqual.
  if (expected.length !== computed.length) {
    return { ok: false, reason: 'mismatch' };
  }
  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(computed, 'hex');
    if (a.length !== b.length) {
      return { ok: false, reason: 'mismatch' };
    }
    if (!timingSafeEqual(a, b)) {
      return { ok: false, reason: 'mismatch' };
    }
  } catch {
    return { ok: false, reason: 'malformed_header' };
  }
  return { ok: true };
}
