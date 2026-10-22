import { get, run } from './db';

// A fixed window limiter held in the database, so it survives a restart and
// is shared by every request the process serves. Behind several processes on
// one machine the SQLite file is still shared; behind several machines this
// table moves with the database.

export type Limit = { max: number; windowMs: number; lockoutMs: number };

export const LIMITS = {
  // Per address and per account: five failures, then refused for the window.
  login: { max: 5, windowMs: 15 * 60_000, lockoutMs: 15 * 60_000 },
  export: { max: 10, windowMs: 60_000, lockoutMs: 60_000 },
  write: { max: 120, windowMs: 60_000, lockoutMs: 60_000 },
  setup: { max: 5, windowMs: 60 * 60_000, lockoutMs: 60 * 60_000 },
} as const satisfies Record<string, Limit>;

export type LimitResult = { allowed: boolean; retryAfterSeconds: number };

export function consume(name: keyof typeof LIMITS, identifier: string): LimitResult {
  const limit = LIMITS[name];
  const now = Date.now();
  const key = `${name}:${identifier.toLowerCase()}`;
  const row = get('SELECT count, window_start, locked_until FROM rate_limits WHERE key = ?', [key]);
  let count = row ? Number(row.count) : 0;
  let windowStart = row ? Number(row.window_start) : now;
  let lockedUntil = row && row.locked_until !== null ? Number(row.locked_until) : 0;

  if (lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000) };
  }
  if (now - windowStart >= limit.windowMs) {
    windowStart = now;
    count = 0;
    lockedUntil = 0;
  }
  count += 1;
  if (count > limit.max) lockedUntil = now + limit.lockoutMs;

  run(
    `INSERT INTO rate_limits (key, count, window_start, locked_until) VALUES (?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET count = excluded.count, window_start = excluded.window_start,
     locked_until = excluded.locked_until`,
    [key, count, windowStart, lockedUntil || null],
  );
  if (lockedUntil > now) return { allowed: false, retryAfterSeconds: Math.ceil(limit.lockoutMs / 1000) };
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clear(name: keyof typeof LIMITS, identifier: string): void {
  run('DELETE FROM rate_limits WHERE key = ?', [`${name}:${identifier.toLowerCase()}`]);
}

// The address a request came from. A client can write anything into
// X-Forwarded-For, so its first entry is never trusted: each proxy in front of
// the app appends the address it received the request from, and the entry
// TRUSTED_PROXY_HOPS places from the right (1 by default, one proxy) is the
// one no client can forge. Next.js fills the header with the socket address
// only when it is absent, so an instance exposed with no proxy at all cannot
// tell a forged address from a real one; the README says to put one in front.
export function callerAddress(headers: Headers): string {
  const chain = (headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? '1');
  const trusted = Number.isInteger(hops) && hops > 0 ? hops : 1;
  if (chain.length >= trusted) return chain[chain.length - trusted]!;
  return headers.get('x-real-ip') ?? 'local';
}
