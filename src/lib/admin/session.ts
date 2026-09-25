/**
 * Sessão do painel admin — cookie assinado com HMAC-SHA256.
 *
 * Substitui o HTTP Basic (popup do navegador) por uma tela de login em
 * /admin/login. As credenciais continuam as mesmas envs ADMIN_USER e
 * ADMIN_PASSWORD; a sessão vira um cookie HttpOnly `<expiraEm>.<assinatura>`.
 *
 * Chave da assinatura: ADMIN_SESSION_SECRET quando setada, senão a própria
 * ADMIN_PASSWORD — assim trocar a senha derruba todas as sessões abertas.
 *
 * Usa Web Crypto (crypto.subtle), que existe tanto no Edge (middleware)
 * quanto no Node (route handlers).
 */

export const ADMIN_SESSION_COOKIE = 'jofi_admin_session';
/** Duração da sessão: 12 horas */
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;

export interface AdminAuthConfig {
  user: string;
  password: string;
  secret: string;
}

/** Lê as envs do admin. null = painel sem credenciais configuradas. */
export function readAdminAuthConfig(): AdminAuthConfig | null {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  if (!user || !password) return null;
  return { user, password, secret: process.env.ADMIN_SESSION_SECRET || password };
}

/**
 * Comparação de strings em tempo constante — não vaza, pelo tempo de
 * execução, onde o mismatch ocorreu.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let result = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    result |= ca ^ cb;
  }
  return result === 0;
}

export function checkCredentials(
  config: AdminAuthConfig,
  user: string,
  password: string,
): boolean {
  // Avalia os dois sempre, pra não vazar pelo tempo qual campo errou
  const userOk = timingSafeEqual(user, config.user);
  const passOk = timingSafeEqual(password, config.password);
  return userOk && passOk;
}

async function sign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Gera o valor do cookie de sessão. `now` em ms (injetável pra teste). */
export async function createSessionToken(
  config: AdminAuthConfig,
  now: number = Date.now(),
): Promise<string> {
  const expiresAt = Math.floor(now / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const sig = await sign(config.secret, `admin:${config.user}:${expiresAt}`);
  return `${expiresAt}.${sig}`;
}

/** Confere assinatura e validade do cookie de sessão. */
export async function verifySessionToken(
  config: AdminAuthConfig,
  token: string | undefined | null,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expiresAt = Number(token.slice(0, dot));
  if (!Number.isInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) return false;
  const expected = await sign(config.secret, `admin:${config.user}:${expiresAt}`);
  return timingSafeEqual(token.slice(dot + 1), expected);
}

/**
 * Destino pós-login. Só aceita caminho interno do painel — barra open
 * redirect (`//site.com`, `https://…`) vindo do parâmetro `next`.
 */
export function safeNextPath(next: unknown): string {
  if (typeof next !== 'string') return '/admin';
  if (!next.startsWith('/admin') || next.startsWith('/admin/login')) return '/admin';
  if (next.includes('//') || next.includes('\\')) return '/admin';
  return next;
}
