const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 3000;

export async function verifyTurnstile(
  token: string | undefined,
  ip: string | undefined,
  secret: string | undefined,
): Promise<{ valid: boolean; skipped: boolean; reason?: string }> {
  // No secret = Turnstile disabled (dev / MVP early). Stories 4.x ativam em prod.
  if (!secret || secret.length === 0) {
    return { valid: true, skipped: true };
  }

  if (!token) {
    return { valid: false, skipped: false, reason: 'missing_token' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token);
    if (ip) body.set('remoteip', ip);

    const response = await fetch(TURNSTILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });
    const json = (await response.json()) as { success?: boolean };
    return { valid: !!json.success, skipped: false };
  } catch {
    return { valid: false, skipped: false, reason: 'verify_error' };
  } finally {
    clearTimeout(timeoutId);
  }
}
