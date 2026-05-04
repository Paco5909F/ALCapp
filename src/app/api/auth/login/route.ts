import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, createSessionToken, getSessionTtlSeconds, verifyAdminCredentials } from '@/lib/auth';
import { clearRateLimit, isRateLimited } from '@/lib/rate-limit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

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

  const ip = getClientIp(request);

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const limiterKey = `${ip}:${email || 'unknown'}`;
  if (isRateLimited(limiterKey)) {
    return NextResponse.json({ error: 'Demasiados intentos. Probá de nuevo más tarde.' }, { status: 429 });
  }

  if (!email || !password || !EMAIL_REGEX.test(email) || password.length > 256) {
    return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
  }

  const isValid = verifyAdminCredentials(email, password);
  if (!isValid) {
    return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
  }

  clearRateLimit(limiterKey);

  const token = createSessionToken(email);
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: getSessionTtlSeconds(),
  });

  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Pragma', 'no-cache');

  return response;
}
