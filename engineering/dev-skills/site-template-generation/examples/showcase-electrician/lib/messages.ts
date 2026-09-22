import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { FILES } from './paths';
import { readJson, writeJson } from './store';

export type Message = {
  id: string;
  receivedAt: string;
  source: string;
  status: 'unread' | 'read' | 'archived';
  fields: { label: string; value: string }[];
};

// The privacy page states how long a message is kept. Enforcing it here is
// what makes that sentence true: anything past the period is dropped the next
// time the inbox is read or written, with no cron to forget to install.
function withinRetention(messages: Message[], months: number | null): Message[] {
  if (!months || months <= 0) return messages;
  const limit = new Date();
  limit.setMonth(limit.getMonth() - months);
  return messages.filter((message) => new Date(message.receivedAt) >= limit);
}

function load(): Message[] {
  const stored = readJson<Message[]>(FILES.messages, []);
  const months = retentionMonths();
  const kept = withinRetention(stored, months);
  if (kept.length !== stored.length) {
    writeJson(FILES.messages, kept);
    console.info(`retention: removed ${stored.length - kept.length} message(s) older than ${months} months`);
  }
  return kept;
}

function retentionMonths(): number | null {
  try {
    const content = JSON.parse(readFileSync(FILES.content, 'utf8')) as {
      legal?: { privacy?: { retentionMonths?: number | null } };
    };
    return content.legal?.privacy?.retentionMonths ?? null;
  } catch {
    return null;
  }
}

export function listMessages(): Message[] {
  return load().sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export function unreadCount(): number {
  return listMessages().filter((message) => message.status === 'unread').length;
}

export function addMessage(source: string, fields: { label: string; value: string }[]): Message {
  const message: Message = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    source,
    status: 'unread',
    fields,
  };
  writeJson(FILES.messages, [message, ...load()]);
  return message;
}

export function setStatus(id: string, status: Message['status']): boolean {
  const messages = load();
  const found = messages.find((message) => message.id === id);
  if (!found) return false;
  found.status = status;
  writeJson(FILES.messages, messages);
  return true;
}

export function removeMessage(id: string): boolean {
  const messages = load();
  const kept = messages.filter((message) => message.id !== id);
  if (kept.length === messages.length) return false;
  writeJson(FILES.messages, kept);
  return true;
}
