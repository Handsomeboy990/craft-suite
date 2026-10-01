import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Everything a running instance owns lives in one writable directory: the
// configuration, the database, the configuration history and the optional
// matrix override. One directory is what a backup needs.
export const DATA_DIR = resolve(process.env.DATA_DIR ?? 'data');

export function ensureDataDir(): void {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(join(DATA_DIR, 'history'), { recursive: true });
}

export const FILES = {
  content: join(DATA_DIR, 'content.json'),
  database: join(DATA_DIR, 'hotel.db'),
  history: join(DATA_DIR, 'history'),
  // Optional. When present it replaces the default matrix of lib/matrix.ts,
  // validated against the declared modules and actions. It is how an operator
  // changes a grant without a rebuild, and how the gate proves the matrix is
  // the only source.
  matrix: join(DATA_DIR, 'matrix.json'),
  // Optional, honoured only on a demonstration database: makes a named widget
  // or list fail or wait, so the error and loading states can be forced.
  faults: join(DATA_DIR, 'faults.json'),
  queryPlans: join(DATA_DIR, 'query-plans.log'),
} as const;
