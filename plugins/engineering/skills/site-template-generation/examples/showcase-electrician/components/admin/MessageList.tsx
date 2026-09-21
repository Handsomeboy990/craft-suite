'use client';

import { useState } from 'react';
import type { Message } from '@/lib/messages';

const LABELS: Record<Message['status'], string> = {
  unread: 'Non lu',
  read: 'Lu',
  archived: 'Archivé',
};

export default function MessageList({ initial, csrf }: { initial: Message[]; csrf: string }) {
  const [messages, setMessages] = useState(initial);
  const [filter, setFilter] = useState<'all' | Message['status']>('all');

  async function setStatus(id: string, status: Message['status']) {
    const response = await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
      body: JSON.stringify({ id, status }),
    });
    if (response.ok) {
      setMessages(messages.map((message) => (message.id === id ? { ...message, status } : message)));
    }
  }

  async function remove(id: string) {
    const response = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-csrf-token': csrf },
    });
    if (response.ok) setMessages(messages.filter((message) => message.id !== id));
  }

  const shown = messages.filter((message) => filter === 'all' || message.status === filter);

  return (
    <div>
      <p className="admin-item__bar" style={{ justifyContent: 'flex-start' }}>
        {(['all', 'unread', 'read', 'archived'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className="admin-small"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === 'all' ? 'Tous' : LABELS[value]}
          </button>
        ))}
      </p>

      {shown.length === 0 ? <p className="admin-field__hint">Aucun message.</p> : null}

      {shown.map((message) => (
        <article
          key={message.id}
          className={message.status === 'unread' ? 'admin-message admin-message--unread' : 'admin-message'}
        >
          <p className="admin-field__hint">
            {new Date(message.receivedAt).toLocaleString()} · {LABELS[message.status]}
          </p>
          <dl>
            {message.fields.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
          <p className="admin-item__bar">
            {message.status !== 'read' ? (
              <button type="button" className="admin-small" onClick={() => setStatus(message.id, 'read')}>
                Marquer lu
              </button>
            ) : (
              <button type="button" className="admin-small" onClick={() => setStatus(message.id, 'unread')}>
                Marquer non lu
              </button>
            )}
            <button type="button" className="admin-small" onClick={() => setStatus(message.id, 'archived')}>
              Archiver
            </button>
            <button type="button" className="admin-small" onClick={() => remove(message.id)}>
              Supprimer
            </button>
          </p>
        </article>
      ))}
    </div>
  );
}
