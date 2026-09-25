import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  checkCredentials,
  readAdminAuthConfig,
  verifySessionToken,
} from '@/lib/admin/session';

/**
 * Admin auth middleware.
 *
 * Camadas (em ordem):
 *  1. Feature flag ADMIN_PANEL_ENABLED='true' — senão, 404 (esconde existência)
 *  2. Config check (ADMIN_USER + ADMIN_PASSWORD setados) — senão, 503
 *  3. /admin/login passa livre (quem já tem sessão volta pro painel)
 *  4. Cookie de sessão assinado (criado pela tela de login) — ver lib/admin/session
 *  5. Fallback HTTP Basic, com rate limit per-IP, pra script que chama a API
 *     (ex: /api/admin/leads/export). O navegador não vê mais o popup: página
 *     sem sessão vai pra /admin/login e API sem sessão recebe 401 em JSON.
 *
 * Matcher cobre `/admin/*` e `/api/admin/*`. O POST do login fica em
 * /api/admin-auth/*, fora do matcher, e tem rate limit próprio.
 */
export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
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

function extractIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

function parseBasicAuth(header: string | null): { user: string; password: string } | null {
  if (!header || !header.startsWith('Basic ')) return null;
  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return null;
  }
  const sep = decoded.indexOf(':');
  if (sep === -1) return null;
  return { user: decoded.slice(0, sep), password: decoded.slice(sep + 1) };
}

export async function middleware(request: NextRequest) {
  if (process.env.ADMIN_PANEL_ENABLED !== 'true') {
    return new NextResponse('Admin panel disabled', { status: 404 });
  }

  const authConfig = readAdminAuthConfig();
  if (!authConfig) {
    return new NextResponse('Admin not configured', { status: 503 });
  }

  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');
  const hasSession = await verifySessionToken(
    authConfig,
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (pathname === '/admin/login') {
    return hasSession
      ? NextResponse.redirect(new URL('/admin', request.url))
      : NextResponse.next();
  }

  if (hasSession) return NextResponse.next();

  const basic = parseBasicAuth(request.headers.get('authorization'));
  if (basic) {
    const ip = extractIp(request);
    if (!checkRateLimit(ip)) {
      return new NextResponse('Too many attempts. Try again in 5 minutes.', {
        status: 429,
        headers: { 'Retry-After': '300' },
      });
    }
    if (checkCredentials(authConfig, basic.user, basic.password)) {
      attempts.delete(ip);
      return NextResponse.next();
    }
  }

  if (isApi) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}
