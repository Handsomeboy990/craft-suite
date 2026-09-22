import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { DATA_DIR } from './paths';
import { readJson, writeJson } from './store';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const FILE = join(DATA_DIR, 'reset.json');
const LIFETIME_MS = 30 * 60_000;

type Pending = { tokenHash: string; expiresAt: number };

// One token at a time, hashed like a password, short lived and single use. A
// client who asks twice invalidates the first link, which is what they expect
// and what stops an old mail in an inbox being a permanent key.
export function issueToken(): string {
  const token = randomBytes(32).toString('hex');
  writeJson(FILE, {
    tokenHash: createHash('sha256').update(token).digest('hex'),
    expiresAt: Date.now() + LIFETIME_MS,
  } satisfies Pending);
  return token;
}

export function tokenValid(token: string): boolean {
  const pending = readJson<Pending | null>(FILE, null);
  if (!pending || pending.expiresAt <= Date.now()) return false;
  const given = createHash('sha256').update(token).digest('hex');
  const expected = Buffer.from(pending.tokenHash, 'hex');
  const offered = Buffer.from(given, 'hex');
  return expected.length === offered.length && timingSafeEqual(expected, offered);
}

export function clearToken(): void {
  writeJson(FILE, null);
}

export async function hashPassword(password: string): Promise<{
  salt: string;
  hash: string;
  params: { N: number; r: number; p: number; keylen: number };
  updatedAt: string;
}> {
  const params = { N: 16384, r: 8, p: 1, keylen: 64 };
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, params.keylen, params)).toString('hex');
  return { salt, hash, params, updatedAt: new Date().toISOString() };
}
