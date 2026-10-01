// Restores a backup made by scripts/backup.mjs into DATA_DIR. Stop the server
// first: the database file is replaced, not merged.
//
//   npm run restore -- backups/<timestamp>
//
// The backup is checked before anything is touched: its integrity, and that
// its row counts match the manifest written when it was taken. The present
// database is moved aside, not deleted, so a wrong restore can be undone.
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const from = process.argv[2];
if (!from || !existsSync(join(from, 'hotel.db')) || !existsSync(join(from, 'manifest.json'))) {
  console.error('Usage: npm run restore -- <backup directory holding hotel.db and manifest.json>');
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(join(from, 'manifest.json'), 'utf8'));
const check = new DatabaseSync(join(from, 'hotel.db'), { readOnly: true });
const integrity = check.prepare('PRAGMA integrity_check').get().integrity_check;
for (const [table, expected] of Object.entries(manifest.counts)) {
  const actual = Number(check.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c);
  if (actual !== expected) {
    console.error(`Refused: ${table} holds ${actual} rows, the manifest says ${expected}.`);
    process.exit(1);
  }
}
check.close();
if (integrity !== 'ok') {
  console.error(`Refused: the backup fails its integrity check (${integrity}).`);
  process.exit(1);
}

const dataDir = resolve(process.env.DATA_DIR ?? 'data');
mkdirSync(dataDir, { recursive: true });
const database = join(dataDir, 'hotel.db');
if (existsSync(database)) {
  const aside = `${database}.before-restore-${Date.now()}`;
  renameSync(database, aside);
  console.log(`The present database was moved to ${aside}`);
}
for (const suffix of ['-wal', '-shm']) rmSync(`${database}${suffix}`, { force: true });
copyFileSync(join(from, 'hotel.db'), database);
copyFileSync(join(from, 'content.json'), join(dataDir, 'content.json'));
if (existsSync(join(from, 'matrix.json'))) copyFileSync(join(from, 'matrix.json'), join(dataDir, 'matrix.json'));
if (existsSync(join(from, 'history'))) cpSync(join(from, 'history'), join(dataDir, 'history'), { recursive: true });
console.log(`Restored ${from} into ${dataDir}. Start the server again.`);
