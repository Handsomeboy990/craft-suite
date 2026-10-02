// Creates the first manager account of an instance, out of band.
//
//   npm run create-admin -- --email someone@example.test --name "A Name"
//
// With ADMIN_PASSWORD in the environment (at least 12 characters) the account
// gets that password. Without it, the script prints a single use link, valid
// 72 hours, through which the account's owner sets their own. The password is
// never stored in clear, never logged and never committed.
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword, MINIMUM_LENGTH } from '../lib/password.mjs';
import { SCHEMA } from '../lib/schema.mjs';

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const email = (option('--email') ?? '').trim().toLowerCase();
const name = (option('--name') ?? '').trim();
if (!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/.test(email) || !name) {
  console.error('Usage: npm run create-admin -- --email <address> --name "<full name>"');
  process.exit(1);
}
const password = process.env.ADMIN_PASSWORD;
if (password !== undefined && password.length < MINIMUM_LENGTH) {
  console.error(`ADMIN_PASSWORD needs at least ${MINIMUM_LENGTH} characters.`);
  process.exit(1);
}

const dataDir = resolve(process.env.DATA_DIR ?? 'data');
mkdirSync(dataDir, { recursive: true });
const config = JSON.parse(readFileSync(join(dataDir, 'content.json'), 'utf8'));
const db = new DatabaseSync(join(dataDir, 'hotel.db'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec(SCHEMA);

if (db.prepare('SELECT id FROM accounts WHERE email = ?').get(email)) {
  console.error(`An account already uses ${email}.`);
  process.exit(1);
}
const hashed = password ? await hashPassword(password) : { salt: null, hash: null, params: null };
const id = Number(
  db
    .prepare("INSERT INTO accounts (name, email, role, active, salt, hash, params, created_at) VALUES (?, ?, 'manager', 1, ?, ?, ?, ?)")
    .run(name, email, hashed.salt, hashed.hash, hashed.params, new Date().toISOString()).lastInsertRowid,
);
console.log(`Manager account created for ${email}.`);
if (!password) {
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO setup_tokens (token_hash, account_id, expires_at) VALUES (?, ?, ?)').run(
    createHash('sha256').update(token).digest('hex'),
    id,
    Date.now() + 72 * 60 * 60_000,
  );
  console.log(`Its owner sets the password here, once, within 72 hours:\n  ${config.site.baseUrl}/setup?token=${token}`);
}
db.close();
