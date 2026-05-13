import { NextResponse, type NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

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

  if (user !== adminUser || password !== adminPassword) return unauthorized();

  return NextResponse.next();
}
