import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin/session';

export const runtime = 'nodejs';

/** POST do botão "Sair" do painel: apaga o cookie e volta pra tela de login. */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
