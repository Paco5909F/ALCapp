import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, getAuthCookieName, getSessionTtlSeconds, hasConfiguredCredentials, verifyAdminCredentials } from '@/lib/auth';
import { clearRateLimit, isRateLimited } from '@/lib/rate-limit';

// Unused EMAIL_REGEX removed
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 256;

type LoginErrorCode =
  | 'SERVER_MISCONFIGURED'
  | 'INVALID_REQUEST'
  | 'RATE_LIMITED'
  | 'INVALID_CREDENTIALS';

function errorResponse(status: number, code: LoginErrorCode, error: string) {
  return NextResponse.json({ error, code }, { status });
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  if (!hasConfiguredCredentials()) {
    return errorResponse(500, 'SERVER_MISCONFIGURED', 'Falta configurar credenciales del servidor.');
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return errorResponse(403, 'INVALID_REQUEST', 'Solicitud inválida.');
      }
    } catch {
      return errorResponse(403, 'INVALID_REQUEST', 'Solicitud inválida.');
    }
  }

  const ip = getClientIp(request);

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_REQUEST', 'Solicitud inválida.');
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const limiterKey = `${ip}:${email || 'unknown'}`;
  if (isRateLimited(limiterKey)) {
    return errorResponse(429, 'RATE_LIMITED', 'Demasiados intentos. Probá de nuevo más tarde.');
  }

  if (!email || !password || email.length > MAX_EMAIL_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return errorResponse(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas.');
  }

  const isValid = verifyAdminCredentials(email, password);
  if (!isValid) {
    return errorResponse(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas.');
  }

  clearRateLimit(limiterKey);

  const token = createSessionToken(email);
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: getAuthCookieName(),
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
