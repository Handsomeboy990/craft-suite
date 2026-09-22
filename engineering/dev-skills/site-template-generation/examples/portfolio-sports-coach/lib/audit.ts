import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR, ensureDataDir } from './paths';

// One line per privileged action, appended and never rewritten. It answers the
// question asked after something goes wrong: what was done, from where, and
// when. It holds no password, no session token and no message body.
export type AuditAction =
  | 'sign-in'
  | 'sign-in-refused'
  | 'sign-out'
  | 'content-write'
  | 'upload'
  | 'upload-refused'
  | 'media-delete'
  | 'message-status'
  | 'message-delete'
  | 'password-change'
  | 'push-subscribe'
  | 'push-unsubscribe';

export function record(action: AuditAction, address: string, detail?: string): void {
  ensureDataDir();
  const line = JSON.stringify({
    at: new Date().toISOString(),
    action,
    address,
    detail: detail?.slice(0, 200),
  });
  try {
    appendFileSync(join(DATA_DIR, 'audit.log'), `${line}\n`, { mode: 0o600 });
  } catch (error) {
    // A failed audit write must not fail the action, and must not be silent.
    console.error('audit log write failed', error);
  }
}
