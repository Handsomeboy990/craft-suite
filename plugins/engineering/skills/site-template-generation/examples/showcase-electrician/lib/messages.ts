import { randomUUID } from 'node:crypto';
import { FILES } from './paths';
import { readJson, writeJson } from './store';

export type Message = {
  id: string;
  receivedAt: string;
  source: string;
  status: 'unread' | 'read' | 'archived';
  fields: { label: string; value: string }[];
};

export function listMessages(): Message[] {
  return readJson<Message[]>(FILES.messages, []).sort((a, b) =>
    b.receivedAt.localeCompare(a.receivedAt),
  );
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
  writeJson(FILES.messages, [message, ...readJson<Message[]>(FILES.messages, [])]);
  return message;
}

export function setStatus(id: string, status: Message['status']): boolean {
  const messages = readJson<Message[]>(FILES.messages, []);
  const found = messages.find((message) => message.id === id);
  if (!found) return false;
  found.status = status;
  writeJson(FILES.messages, messages);
  return true;
}

export function removeMessage(id: string): boolean {
  const messages = readJson<Message[]>(FILES.messages, []);
  const kept = messages.filter((message) => message.id !== id);
  if (kept.length === messages.length) return false;
  writeJson(FILES.messages, kept);
  return true;
}
