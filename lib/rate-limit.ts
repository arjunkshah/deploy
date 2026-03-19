const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 5;
const bucket = new Map<string, number[]>();

export function checkRateLimit(ip: string) {
  const now = Date.now();
  const existing = bucket.get(ip) ?? [];
  const filtered = existing.filter((t) => now - t < WINDOW_MS);
  filtered.push(now);
  bucket.set(ip, filtered);
  const remaining = Math.max(0, MAX_REQUESTS - filtered.length);
  return {
    ok: filtered.length <= MAX_REQUESTS,
    remaining,
    retryAfter: remaining === 0 ? WINDOW_MS - (now - filtered[0]) : 0
  };
}
