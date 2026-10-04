// Sets the back office password. Run once per instance, and again to rotate.
//
//   npm run set-password -- 'the new password'
//
// The password is never stored, never logged and never committed: only the
// scrypt hash, its salt and its parameters reach the data directory. Rotating
// the password deletes every existing session.
import { randomBytes, scryptSync } from 'node:crypto';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run set-password -- \'<at least 12 characters>\'');
  process.exit(1);
}

const dataDir = resolve(process.env.DATA_DIR ?? 'data');
mkdirSync(dataDir, { recursive: true });

const params = { N: 16384, r: 8, p: 1, keylen: 64 };
const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, params.keylen, params).toString('hex');

writeFileSync(
  join(dataDir, 'admin.json'),
  JSON.stringify({ salt, hash, params, updatedAt: new Date().toISOString() }, null, 2),
  { mode: 0o600 },
);
rmSync(join(dataDir, 'sessions.json'), { force: true });

console.log(`Password set in ${join(dataDir, 'admin.json')}. Existing sessions were invalidated.`);
