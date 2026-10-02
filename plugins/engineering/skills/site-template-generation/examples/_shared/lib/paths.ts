import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Everything the instance owns lives in one writable directory: the content
// file, the uploads, the messages, the sessions, the push subscriptions and the
// rate limit counters. One directory is what a backup needs, and the handover
// names it.
export const DATA_DIR = resolve(process.env.DATA_DIR ?? 'data');
export const UPLOAD_DIR = join(DATA_DIR, 'uploads');

export function ensureDataDir(): void {
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const FILES = {
  content: join(DATA_DIR, 'content.json'),
  admin: join(DATA_DIR, 'admin.json'),
  sessions: join(DATA_DIR, 'sessions.json'),
  messages: join(DATA_DIR, 'messages.json'),
  subscriptions: join(DATA_DIR, 'subscriptions.json'),
  rateLimits: join(DATA_DIR, 'rate-limits.json'),
} as const;
