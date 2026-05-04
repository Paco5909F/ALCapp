type AttemptEntry = {
  count: number;
  resetAt: number;
};

const ATTEMPTS = new Map<string, AttemptEntry>();

export function isRateLimited(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = ATTEMPTS.get(key);

  if (!entry || entry.resetAt < now) {
    ATTEMPTS.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  ATTEMPTS.set(key, entry);
  return entry.count > maxAttempts;
}

export function clearRateLimit(key: string): void {
  ATTEMPTS.delete(key);
}
