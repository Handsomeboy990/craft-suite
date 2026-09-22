'use client';

import { useState } from 'react';
import type { Version } from '@/lib/history';

// Undo, in the only form a client needs: a date, and a button.
export default function HistoryList({ versions, csrf }: { versions: Version[]; csrf: string }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState('');

  if (versions.length === 0) {
    return (
      <p className="admin-field__hint">
        Aucune version antérieure pour l’instant. Dès votre première modification, la version
        remplacée est conservée ici.
      </p>
    );
  }

  return (
    <div>
      <p
        className={error ? 'form__status form__status--error' : 'form__status'}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      <ul className="admin-media" style={{ gridTemplateColumns: '1fr' }}>
        {versions.map((version) => (
          <li key={version.id} className="admin-message">
            <p style={{ margin: 0 }}>
              <strong>{new Date(version.at).toLocaleString()}</strong>
            </p>
            <p className="admin-field__hint">
              {version.id.endsWith('revert') ? 'avant une restauration' : 'avant une modification'} ·{' '}
              {Math.round(version.bytes / 1024)} ko
            </p>
            <p className="admin-item__bar">
              <button
                type="button"
                className="admin-small"
                disabled={busy !== ''}
                onClick={async () => {
                  setBusy(version.id);
                  const response = await fetch('/api/admin/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
                    body: JSON.stringify({ id: version.id }),
                  });
                  const body = (await response.json()) as { ok: boolean; error?: string };
                  setBusy('');
                  if (response.ok && body.ok) {
                    setError(false);
                    setMessage('Version restaurée. Rechargez votre site pour la voir.');
                    window.setTimeout(() => window.location.reload(), 900);
                  } else {
                    setError(true);
                    setMessage(body.error ?? 'Restauration refusée.');
                  }
                }}
              >
                {busy === version.id ? 'Restauration' : 'Revenir à cette version'}
              </button>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
