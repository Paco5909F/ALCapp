import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifySessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 403 });
    }
  }

  const cookie = request.cookies.get(getAuthCookieName());
  const token = cookie?.value;

  if (!token || !verifySessionToken(token)) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getAuthCookieName(),
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Pragma', 'no-cache');
  return response;
}