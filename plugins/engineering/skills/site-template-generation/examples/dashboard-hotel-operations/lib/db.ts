import { appendFileSync } from 'node:fs';
import { DatabaseSync, type SupportedValueType } from 'node:sqlite';
import { FILES, ensureDataDir } from './paths';
import { SCHEMA } from './schema.mjs';

// One SQLite file for one property. SQLite serialises writers, which is what
// makes the overlap trigger a real guarantee rather than a hopeful check; the
// threshold that moves an instance to a server database (several writers on
// several machines, a second property) is in the README.

type Global = typeof globalThis & { __hotelDb?: DatabaseSync };

export type Row = Record<string, string | number | null>;
export type Params = SupportedValueType[];

export function db(): DatabaseSync {
  const g = globalThis as Global;
  if (g.__hotelDb) return g.__hotelDb;
  ensureDataDir();
  const database = new DatabaseSync(FILES.database);
  database.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  database.exec(SCHEMA);
  g.__hotelDb = database;
  return database;
}

export function all(sql: string, params: Params = []): Row[] {
  return db().prepare(sql).all(...params) as Row[];
}

export function get(sql: string, params: Params = []): Row | undefined {
  return db().prepare(sql).get(...params) as Row | undefined;
}

export function run(sql: string, params: Params = []): { changes: number; lastId: number } {
  const result = db().prepare(sql).run(...params);
  return { changes: Number(result.changes), lastId: Number(result.lastInsertRowid) };
}

// A serialised transaction. BEGIN IMMEDIATE takes the write lock up front, so
// a rule checked inside it cannot be invalidated by a concurrent writer.
export function tx<T>(work: () => T): T {
  const database = db();
  database.exec('BEGIN IMMEDIATE');
  try {
    const result = work();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

export function meta(key: string): string | null {
  const row = get('SELECT value FROM meta WHERE key = ?', [key]);
  return row ? String(row.value) : null;
}

// Set by the seed. A demonstration database says so on every screen.
export function isDemonstration(): boolean {
  return meta('demo') === '1';
}

// With QUERY_PLAN_LOG set, each list query's plan is appended to a log, which
// is how the gate proves every list uses an index on the seeded volume.
export function logPlan(label: string, sql: string, params: Params): void {
  if (!process.env.QUERY_PLAN_LOG) return;
  try {
    const plan = db()
      .prepare(`EXPLAIN QUERY PLAN ${sql}`)
      .all(...params) as { detail: string }[];
    appendFileSync(
      FILES.queryPlans,
      `${JSON.stringify({ label, sql, plan: plan.map((step) => step.detail) })}\n`,
    );
  } catch (error) {
    console.error('query plan log failed', error);
  }
}

// SQLite reports a constraint by its message; this names the ones the
// endpoints translate into a 409.
export function constraintOf(error: unknown): string | null {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('stay_overlap')) return 'overlap';
  if (message.includes('append_only')) return 'appendOnly';
  if (message.includes('CHECK constraint failed')) return 'check';
  if (message.includes('UNIQUE constraint failed')) return 'unique';
  if (message.includes('FOREIGN KEY constraint failed')) return 'reference';
  return null;
}
