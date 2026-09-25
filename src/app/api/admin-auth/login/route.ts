import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit/in-memory';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  checkCredentials,
  createSessionToken,
  readAdminAuthConfig,
  safeNextPath,
} from '@/lib/admin/session';

export const runtime = 'nodejs';

/**
 * POST do formulário de /admin/login.
 *
 * Fica fora de /api/admin (o middleware exigiria sessão pra chegar aqui).
 * Responde sempre com redirect 303: sucesso vai pro `next`, falha volta pra
 * tela com `?erro=`. Rate limit por IP: 10 tentativas a cada 10 min.
 */
export async function POST(request: NextRequest) {
  if (process.env.ADMIN_PANEL_ENABLED !== 'true') {
    return new NextResponse('Admin panel disabled', { status: 404 });
  }
  const config = readAdminAuthConfig();
  if (!config) {
    return new NextResponse('Admin not configured', { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  const user = String(form?.get('user') ?? '').trim();
  const password = String(form?.get('password') ?? '');
  const next = safeNextPath(form?.get('next'));

  const back = (erro: string) => {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('erro', erro);
    if (next !== '/admin') url.searchParams.set('next', next);
    return NextResponse.redirect(url, 303);
  };

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  if (!checkRateLimit(`admin-login:${ip}`).allowed) return back('limite');

  if (!checkCredentials(config, user, password)) return back('credenciais');

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, await createSessionToken(config), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  return response;
}
