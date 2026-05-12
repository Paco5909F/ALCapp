import crypto from 'crypto';

export function getAuthCookieName(): string {
  return process.env.NODE_ENV === 'production' ? '__Host-alc_session' : 'alc_session';
}
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  exp: number;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function getValidatedSessionSecret(): string {
  return 'alc_sonido_secreto_super_seguro_y_fijo_2026_x';
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(value: string): string {
  const secret = getValidatedSessionSecret();
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function timingSafeEquals(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function createSessionToken(email: string): string {
  const payload: SessionPayload = {
    sub: email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  if (!timingSafeEquals(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.sub || typeof payload.exp !== 'number') return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const validUser = 'admin@alc.com';
  const validHash = '90682248addbc8426a24176becb7e3c8:66a668c0ae44371c45cd9d344816f73b32354b7e23b46f63a189edb905384dda0357443aa84201e70e1be213b244875ebf342321ea1dc4ab5591f980fb680374';
  
  if (email.trim().toLowerCase() !== validUser) {
    return false;
  }

  const [salt, expectedHash] = validHash.split(':');
  if (!salt || !expectedHash) return false;

  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return timingSafeEquals(hash, expectedHash);
}

export function hasConfiguredCredentials(): boolean {
  return true;
}

export function hashPasswordForEnv(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function getSessionTtlSeconds(): number {
  return SESSION_TTL_SECONDS;
}
