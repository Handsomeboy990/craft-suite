import { readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { ensureDataDir } from './paths';

// A JSON file store with atomic writes. Adequate for one site on one process,
// which is what a client site is. The threshold that would change this decision
// is stated in the README: more than one server process, or a message volume
// where rewriting the file on every write becomes visible. At that point the
// messages move to a database and this module is the only thing that changes.

export function readJson<T>(file: string, fallback: T): T {
  try {
    if (!existsSync(file)) return fallback;
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

// Write to a temporary file in the same directory, then rename. A crash in the
// middle leaves the previous file intact rather than half of the new one.
export function writeJson(file: string, value: unknown): void {
  ensureDataDir();
  const temporary = join(dirname(file), `.${randomBytes(6).toString('hex')}.tmp`);
  // The trailing newline is not decoration: without it every save shows up as
  // a diff against a file any editor would have terminated properly.
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, file);
}
