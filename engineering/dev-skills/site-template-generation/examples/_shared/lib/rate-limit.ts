import { FILES } from './paths';
import { readJson, writeJson } from './store';

// A fixed window limiter, shared through the data directory so it survives a
// restart. One process serves this site; behind two processes this store moves
// to something both can see, and that is the only change needed.

type Bucket = { count: number; windowStart: number; lockedUntil?: number };
type Buckets = Record<string, Bucket>;

export type Limit = {
  /** Requests allowed inside the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** How long a caller is refused after exceeding it. */
  lockoutMs: number;
};

export const LIMITS = {
  login: { max: 5, windowMs: 15 * 60_000, lockoutMs: 15 * 60_000 },
  // Its own budget: asking for a link must not spend the attempts the client
  // needs to sign in with the password they just set.
  reset: { max: 3, windowMs: 60 * 60_000, lockoutMs: 60 * 60_000 },
  contact: { max: 5, windowMs: 60 * 60_000, lockoutMs: 60 * 60_000 },
  upload: { max: 20, windowMs: 60_000, lockoutMs: 60_000 },
  write: { max: 120, windowMs: 60_000, lockoutMs: 60_000 },
} as const satisfies Record<string, Limit>;

export type LimitResult = { allowed: boolean; retryAfterSeconds: number };

function prune(buckets: Buckets, now: number): Buckets {
  const kept: Buckets = {};
  for (const [key, bucket] of Object.entries(buckets)) {
    const alive = now - bucket.windowStart < 24 * 60 * 60_000 || (bucket.lockedUntil ?? 0) > now;
    if (alive) kept[key] = bucket;
  }
  return kept;
}

export function consume(name: keyof typeof LIMITS, identifier: string): LimitResult {
  const limit = LIMITS[name];
  const now = Date.now();
  const key = `${name}:${identifier}`;
  const buckets = prune(readJson<Buckets>(FILES.rateLimits, {}), now);
  const bucket = buckets[key] ?? { count: 0, windowStart: now };

  if (bucket.lockedUntil && bucket.lockedUntil > now) {
    writeJson(FILES.rateLimits, buckets);
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000) };
  }

  if (now - bucket.windowStart >= limit.windowMs) {
    bucket.windowStart = now;
    bucket.count = 0;
    delete bucket.lockedUntil;
  }

  bucket.count += 1;

  if (bucket.count > limit.max) {
    bucket.lockedUntil = now + limit.lockoutMs;
    buckets[key] = bucket;
    writeJson(FILES.rateLimits, buckets);
    return { allowed: false, retryAfterSeconds: Math.ceil(limit.lockoutMs / 1000) };
  }

  buckets[key] = bucket;
  writeJson(FILES.rateLimits, buckets);
  return { allowed: true, retryAfterSeconds: 0 };
}

// A successful sign in clears the failure count, so a client who mistyped once
// is not locked out by their own success.
export function reset(name: keyof typeof LIMITS, identifier: string): void {
  const buckets = readJson<Buckets>(FILES.rateLimits, {});
  delete buckets[`${name}:${identifier}`];
  writeJson(FILES.rateLimits, buckets);
}

// The address a request came from, behind a proxy or not. A deployment that
// terminates TLS elsewhere must set the header, and the README says so.
export function callerAddress(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
