const SESSION_TTL_SKEW_SECONDS = 5;

type SessionPayload = {
  sub: string;
  exp: number;
};

export function getAuthCookieName(): string {
  return process.env.NODE_ENV === 'production' ? '__Host-alc_session' : 'alc_session';
}

function getSessionSecret(): string | null {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

function base64UrlToBytes(input: string): Uint8Array {
  const padLength = (4 - (input.length % 4)) % 4;
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function sign(input: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
  return new Uint8Array(signature);
}

export async function verifySessionTokenEdge(token: string): Promise<SessionPayload | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  const [encodedPayload, encodedSignature] = token.split('.');
  if (!encodedPayload || !encodedSignature) return null;

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = base64UrlToBytes(encodedSignature);
  } catch {
    return null;
  }

  const expectedSignature = await sign(encodedPayload, secret);
  if (!timingSafeEqualBytes(signatureBytes, expectedSignature)) {
    return null;
  }

  try {
    const payloadJson = new TextDecoder().decode(base64UrlToBytes(encodedPayload));
    const payload = JSON.parse(payloadJson) as SessionPayload;
    if (!payload.sub || typeof payload.exp !== 'number') return null;
    if (payload.exp + SESSION_TTL_SKEW_SECONDS < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
