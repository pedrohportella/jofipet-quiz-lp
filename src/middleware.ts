import { NextResponse, type NextRequest } from 'next/server';

/**
 * Admin auth middleware.
 *
 * Camadas (em ordem):
 *  1. Feature flag ADMIN_PANEL_ENABLED='true' — senão, 404 (esconde existência)
 *  2. Config check (ADMIN_USER + ADMIN_PASSWORD setados) — senão, 503
 *  3. Rate limit per-IP (em memória, 10 tentativas por 5 min) — 429 se excedido
 *  4. HTTP Basic auth — 401 com WWW-Authenticate se ausente/inválido
 *  5. Constant-time string compare pra credenciais — mitiga timing attacks
 *
 * Matcher cobre `/admin/*` e `/api/admin/*` (inclui /api/admin/leads/export).
 */
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

// Rate limit em memória — funciona por instância serverless (cold start zera).
// Suficiente pra mitigar brute force casual; pra ataques distribuídos
// precisaria de Vercel KV ou similar.
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

function recordSuccess(ip: string): void {
  // Reset on successful auth — não punir credenciais corretas vindas de IP "queimado"
  attempts.delete(ip);
}

function extractIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

/**
 * Comparação de strings em tempo constante — não vaza informação sobre
 * onde o mismatch ocorreu via tempo de execução.
 *
 * Não usamos `crypto.timingSafeEqual` porque ele requer Buffer (Node-only)
 * e middleware roda em Edge runtime. Implementação manual é suficiente:
 * processa SEMPRE todos os caracteres do candidato, independente de match.
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Comprimentos diferentes: ainda processamos pra não vazar via tempo
  const maxLen = Math.max(a.length, b.length);
  let result = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    result |= ca ^ cb;
  }
  return result === 0;
}

function unauthorized(): NextResponse {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Jofi Quiz Admin"' },
  });
}

export function middleware(request: NextRequest) {
  if (process.env.ADMIN_PANEL_ENABLED !== 'true') {
    return new NextResponse('Admin panel disabled', { status: 404 });
  }

  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    return new NextResponse('Admin not configured', { status: 503 });
  }

  const ip = extractIp(request);
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too many attempts. Try again in 5 minutes.', {
      status: 429,
      headers: { 'Retry-After': '300' },
    });
  }

  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return unauthorized();

  const base64 = auth.slice(6);
  let decoded: string;
  try {
    decoded = atob(base64);
  } catch {
    return unauthorized();
  }
  const sep = decoded.indexOf(':');
  if (sep === -1) return unauthorized();
  const user = decoded.slice(0, sep);
  const password = decoded.slice(sep + 1);

  // Constant-time compare pros 2 campos
  const userOk = timingSafeEqual(user, adminUser);
  const passOk = timingSafeEqual(password, adminPassword);
  if (!userOk || !passOk) return unauthorized();

  recordSuccess(ip);
  return NextResponse.next();
}
