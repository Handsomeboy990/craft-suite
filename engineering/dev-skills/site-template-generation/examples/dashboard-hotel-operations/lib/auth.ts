import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getConfig } from './config';
import { get, run } from './db';
import { isRole, type Role } from './matrix';
import { verifyPassword } from './password.mjs';

// Sessions are random tokens held in an httpOnly cookie. The server keeps only
// an HMAC of each token under SESSION_SECRET, with its account, its CSRF token
// and its expiry. Nothing a script on the page can read identifies a session.
//
// The account is read on every request, joined to the session: a role changed
// or an account deactivated takes effect on the next request, not at the next
// sign in.

export const COOKIE = 'session';

// Idle lifetime, from the retention the privacy notice states.
function lifetimeMs(): number {
  return getConfig().privacy.retention.sessionHours * 60 * 60_000;
}

export type Account = { id: number; name: string; email: string; role: Role };
export type Session = { account: Account; csrf: string; tokenHash: string };

function secret(): string {
  const value = process.env.SESSION_SECRET ?? '';
  if (value.length < 32) {
    throw new Error('SESSION_SECRET is missing or shorter than 32 characters; see .env.example');
  }
  return value;
}

export function tokenHash(token: string): string {
  return createHmac('sha256', secret()).update(token).digest('hex');
}

export function arrivedOverHttps(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-proto');
  if (forwarded) return forwarded.split(',')[0]!.trim() === 'https';
  return new URL(request.url).protocol === 'https:';
}

// The identifier is the account's email. An unknown identifier, an inactive
// account and a wrong password take the same work and get the same answer.
export async function checkCredentials(identifier: string, password: string): Promise<Account | null> {
  const row = get('SELECT id, name, email, role, active, salt, hash, params FROM accounts WHERE email = ?', [
    identifier,
  ]);
  const ok = await verifyPassword(password, row ?? null);
  if (!row || !ok || Number(row.active) !== 1 || !isRole(row.role)) return null;
  return { id: Number(row.id), name: String(row.name), email: String(row.email), role: row.role };
}

export async function createSession(account: Account, address: string, secure: boolean): Promise<void> {
  const token = randomBytes(32).toString('hex');
  const now = Date.now();
  const LIFETIME_MS = lifetimeMs();
  run('DELETE FROM sessions WHERE expires_at <= ?', [now]);
  run(
    'INSERT INTO sessions (token_hash, account_id, csrf, issued_at, expires_at, address) VALUES (?, ?, ?, ?, ?, ?)',
    [tokenHash(token), account.id, randomBytes(24).toString('hex'), now, now + LIFETIME_MS, address],
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: Math.floor(LIFETIME_MS / 1000),
  });
}

// null means "no usable session": none sent, expired, signed out, or the
// account deactivated since. `sent` says whether a cookie arrived at all, so a
// page can tell "your session ended" from "please sign in".
export async function currentSession(): Promise<{ session: Session | null; sent: boolean }> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return { session: null, sent: Boolean(token) };
  const hash = tokenHash(token);
  const now = Date.now();
  const LIFETIME_MS = lifetimeMs();
  const row = get(
    `SELECT s.csrf, s.expires_at, a.id, a.name, a.email, a.role, a.active
     FROM sessions s JOIN accounts a ON a.id = s.account_id WHERE s.token_hash = ?`,
    [hash],
  );
  if (!row || Number(row.expires_at) <= now || Number(row.active) !== 1 || !isRole(row.role)) {
    return { session: null, sent: true };
  }
  // Renewed on use rather than extended forever: an idle session still dies.
  if (Number(row.expires_at) - now < LIFETIME_MS - 60_000) {
    run('UPDATE sessions SET expires_at = ? WHERE token_hash = ?', [now + LIFETIME_MS, hash]);
  }
  return {
    sent: true,
    session: {
      tokenHash: hash,
      csrf: String(row.csrf),
      account: { id: Number(row.id), name: String(row.name), email: String(row.email), role: row.role },
    },
  };
}

// Signing out deletes the server record. Clearing a cookie is not a sign out.
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) run('DELETE FROM sessions WHERE token_hash = ?', [tokenHash(token)]);
  jar.delete(COOKIE);
}

export function csrfMatches(sent: string | null, expected: string): boolean {
  if (!sent || sent.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sent), Buffer.from(expected));
}

export const MAX_BODY_BYTES = 64 * 1024;
