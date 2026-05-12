import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifySessionTokenEdge } from '@/lib/auth-edge';

const PUBLIC_PATHS = new Set(['/login']);

export async function proxy(request: NextRequest) {
  const authCookieName = getAuthCookieName();
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(authCookieName)?.value;

  const isSessionValid = token ? Boolean(await verifySessionTokenEdge(token)) : false;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth') || pathname === '/favicon.ico' || pathname.startsWith('/images/')) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    if (isSessionValid) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const response = NextResponse.next();
    if (token) {
      response.cookies.set({
        name: authCookieName,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });
    }
    return response;
  }

  if (!isSessionValid) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) {
      response.cookies.set({
        name: authCookieName,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*).*)'],
};
