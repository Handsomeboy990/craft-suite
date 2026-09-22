import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { FILES } from './paths';
import { readJson, writeJson } from './store';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const COOKIE = 'session';
const LIFETIME_MS = 8 * 60 * 60_000;

type AdminRecord = { salt: string; hash: string; params: { N: number; r: number; p: number; keylen: number } };
type SessionRecord = { tokenHash: string; csrf: string; issuedAt: number; expiresAt: number; address: string };
type Sessions = Record<string, SessionRecord>;

export function isConfigured(): boolean {
  return readJson<AdminRecord | null>(FILES.admin, null) !== null;
}

// The same work is done for a wrong password and for an unconfigured instance,
// so the answer and its timing say nothing about which case it was.
export async function verifyPassword(password: string): Promise<boolean> {
  const record = readJson<AdminRecord | null>(FILES.admin, null);
  const params = record?.params ?? { N: 16384, r: 8, p: 1, keylen: 64 };
  const salt = record?.salt ?? 'unconfigured';
  const derived = await scrypt(password, salt, params.keylen, params);
  if (!record) return false;
  const expected = Buffer.from(record.hash, 'hex');
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

// Rotation belongs to the client, not to whoever has a shell on the server.
// The current password is required, the new one is checked for length here as
// well as in the browser, and every session dies with the change, including the
// one that made it.
export const MINIMUM_PASSWORD_LENGTH = 12;

export async function changePassword(current: string, next: string): Promise<'ok' | 'wrong' | 'short'> {
  if (next.length < MINIMUM_PASSWORD_LENGTH) return 'short';
  if (!(await verifyPassword(current))) return 'wrong';

  const record = readJson<AdminRecord | null>(FILES.admin, null);
  const params = record?.params ?? { N: 16384, r: 8, p: 1, keylen: 64 };
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(next, salt, params.keylen, params)).toString('hex');
  writeJson(FILES.admin, { salt, hash, params, updatedAt: new Date().toISOString() });
  writeJson(FILES.sessions, {});
  return 'ok';
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function prune(sessions: Sessions, now: number): Sessions {
  const kept: Sessions = {};
  for (const [key, session] of Object.entries(sessions)) {
    if (session.expiresAt > now) kept[key] = session;
  }
  return kept;
}

// `secure` follows the protocol the request actually arrived on, not the build
// mode: a site served over https always gets a Secure cookie, and an operator
// testing a production build over http on their own machine can still sign in.
export function arrivedOverHttps(request: Request): boolean {
  const forwarded = request.headers.get('x-forwarded-proto');
  if (forwarded) return forwarded.split(',')[0]!.trim() === 'https';
  return new URL(request.url).protocol === 'https:';
}

export async function createSession(address: string, secure: boolean): Promise<void> {
  const token = randomBytes(32).toString('hex');
  const now = Date.now();
  const sessions = prune(readJson<Sessions>(FILES.sessions, {}), now);
  sessions[hashToken(token)] = {
    tokenHash: hashToken(token),
    csrf: randomBytes(24).toString('hex'),
    issuedAt: now,
    expiresAt: now + LIFETIME_MS,
    address,
  };
  writeJson(FILES.sessions, sessions);

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: Math.floor(LIFETIME_MS / 1000),
  });
}

export async function readSession(): Promise<SessionRecord | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const now = Date.now();
  const sessions = readJson<Sessions>(FILES.sessions, {});
  const session = sessions[hashToken(token)];
  if (!session || session.expiresAt <= now) return null;

  // Renewed on use rather than extended forever: an idle session still dies.
  session.expiresAt = now + LIFETIME_MS;
  sessions[hashToken(token)] = session;
  writeJson(FILES.sessions, prune(sessions, now));
  return session;
}

// Signing out deletes the server record. Clearing a cookie is not a sign out.
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const sessions = readJson<Sessions>(FILES.sessions, {});
    delete sessions[hashToken(token)];
    writeJson(FILES.sessions, sessions);
  }
  jar.delete(COOKIE);
}

// Every state changing request carries a token bound to the session. SameSite
// is a mitigation, not the control.
export async function requireSession(request: Request): Promise<SessionRecord> {
  const session = await readSession();
  if (!session) throw new HttpError(401, 'sign in first');

  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const sent = request.headers.get('x-csrf-token');
    if (!sent || sent.length !== session.csrf.length) throw new HttpError(403, 'missing token');
    if (!timingSafeEqual(Buffer.from(sent), Buffer.from(session.csrf))) {
      throw new HttpError(403, 'invalid token');
    }
  }
  return session;
}

// A request body is read whole before anything validates it, so its size is
// checked before it is read at all. The content file of a site is tens of
// kilobytes; a megabyte is already generous.
export const MAX_BODY_BYTES = 1024 * 1024;

export function refuseOversizedBody(request: Request): Response | null {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: 'requête trop volumineuse' }, { status: 413 });
  }
  return null;
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
