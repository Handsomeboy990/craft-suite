import { createHash, randomBytes } from 'node:crypto';
import { get, run, tx } from './db';
import { MINIMUM_LENGTH, hashPassword } from './password.mjs';

// One account per person, created by a manager without a password. Its owner
// sets the first password through a single use link that expires. The token
// is stored hashed; the link is shown once to the manager who created it.

const LIFETIME_MS = 72 * 60 * 60_000;

const digest = (token: string) => createHash('sha256').update(token).digest('hex');

export function issueSetupToken(accountId: number): string {
  const token = randomBytes(32).toString('hex');
  run('DELETE FROM setup_tokens WHERE account_id = ?', [accountId]);
  run('INSERT INTO setup_tokens (token_hash, account_id, expires_at) VALUES (?, ?, ?)', [
    digest(token),
    accountId,
    Date.now() + LIFETIME_MS,
  ]);
  return token;
}

export async function useSetupToken(token: string, password: string): Promise<'ok' | 'invalid' | 'short'> {
  if (!/^[0-9a-f]{64}$/.test(token)) return 'invalid';
  if (password.length < MINIMUM_LENGTH) return 'short';
  const hashed = await hashPassword(password);
  return tx(() => {
    const row = get('SELECT account_id, expires_at, used_at FROM setup_tokens WHERE token_hash = ?', [digest(token)]);
    if (!row || row.used_at !== null || Number(row.expires_at) <= Date.now()) return 'invalid';
    run('UPDATE setup_tokens SET used_at = ? WHERE token_hash = ?', [Date.now(), digest(token)]);
    run('UPDATE accounts SET salt = ?, hash = ?, params = ? WHERE id = ?', [
      hashed.salt,
      hashed.hash,
      hashed.params,
      Number(row.account_id),
    ]);
    run('DELETE FROM sessions WHERE account_id = ?', [Number(row.account_id)]);
    return 'ok';
  });
}
