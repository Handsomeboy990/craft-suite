// Backs up an instance: a consistent copy of the database taken with
// VACUUM INTO (safe while the server runs), the configuration, its history and
// the matrix override when there is one, in one dated directory.
//
//   npm run backup                 into ./backups/<timestamp>/
//   npm run backup -- <directory>  into <directory>/<timestamp>/
//
// A backup is untested until a restore has been performed from it:
// `npm run restore -- <that directory>` into a scratch DATA_DIR, then compare.
import { copyFileSync, cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dataDir = resolve(process.env.DATA_DIR ?? 'data');
const root = resolve(process.argv[2] ?? 'backups');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = join(root, stamp);
mkdirSync(target, { recursive: true });

const source = new DatabaseSync(join(dataDir, 'hotel.db'));
const destination = join(target, 'hotel.db');
source.prepare('VACUUM INTO ?').run(destination);
source.close();

copyFileSync(join(dataDir, 'content.json'), join(target, 'content.json'));
if (existsSync(join(dataDir, 'matrix.json'))) copyFileSync(join(dataDir, 'matrix.json'), join(target, 'matrix.json'));
if (existsSync(join(dataDir, 'history'))) cpSync(join(dataDir, 'history'), join(target, 'history'), { recursive: true });

const copy = new DatabaseSync(destination, { readOnly: true });
const integrity = copy.prepare('PRAGMA integrity_check').get();
const counts = {};
for (const table of ['accounts', 'rooms', 'guests', 'stays', 'folios', 'ledger', 'items', 'movements', 'tasks', 'audit']) {
  counts[table] = Number(copy.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c);
}
copy.close();
writeFileSync(join(target, 'manifest.json'), `${JSON.stringify({ takenAt: new Date().toISOString(), integrity: integrity.integrity_check, counts }, null, 2)}\n`);
console.log(`Backup written to ${target} (integrity: ${integrity.integrity_check})`);
console.log(JSON.stringify(counts));
