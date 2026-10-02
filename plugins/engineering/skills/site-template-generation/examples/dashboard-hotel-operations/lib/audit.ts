import { run } from './db';

// One row per privileged action and per refusal, appended and never rewritten
// (a trigger refuses UPDATE and DELETE). It records who, what, which record,
// when, from where and whether it was allowed. It never holds a password, a
// token or a free text field of a record: callers pass identifiers only.

export type AuditEntry = {
  accountId?: number | null;
  role?: string | null;
  action: string;
  module?: string | null;
  record?: string | number | null;
  outcome: 'allowed' | 'refused';
  status?: number;
  address?: string;
};

export function audit(entry: AuditEntry): void {
  try {
    run(
      `INSERT INTO audit (at, account_id, role, action, module, record, outcome, status, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        new Date().toISOString(),
        entry.accountId ?? null,
        entry.role ?? null,
        entry.action.slice(0, 60),
        entry.module ?? null,
        entry.record === undefined || entry.record === null ? null : String(entry.record).slice(0, 40),
        entry.outcome,
        entry.status ?? null,
        entry.address ?? null,
      ],
    );
  } catch (error) {
    // A failed audit write must not fail the action, and must not be silent.
    console.error('audit write failed', error);
  }
}
