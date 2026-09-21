'use client';

import { useState } from 'react';

// Changing the password ends every session, including this one. The form says
// so before the client presses the button rather than after.
export default function PasswordForm({ csrf }: { csrf: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'done'>('idle');
  const [message, setMessage] = useState('');

  return (
    <form
      className="form"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const next = String(data.get('next') ?? '');
        if (next !== String(data.get('confirm') ?? '')) {
          setStatus('error');
          setMessage('Les deux nouveaux mots de passe ne sont pas identiques.');
          return;
        }

        setStatus('sending');
        const response = await fetch('/api/admin/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf },
          body: JSON.stringify({ current: String(data.get('current') ?? ''), next }),
        });
        const body = (await response.json()) as { ok: boolean; error?: string };

        if (response.ok && body.ok) {
          setStatus('done');
          setMessage('Mot de passe changé. Toutes les sessions sont fermées, reconnectez-vous.');
          window.setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2500);
          return;
        }
        setStatus('error');
        setMessage(body.error ?? 'Refusé.');
      }}
    >
      <p className="field">
        <label className="field__label" htmlFor="current">
          Mot de passe actuel
        </label>
        <input id="current" name="current" type="password" required autoComplete="current-password" />
      </p>
      <p className="field">
        <label className="field__label" htmlFor="next">
          Nouveau mot de passe
        </label>
        <input
          id="next"
          name="next"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
        />
        <span className="admin-field__hint">Au moins 12 caractères.</span>
      </p>
      <p className="field">
        <label className="field__label" htmlFor="confirm">
          Répéter le nouveau mot de passe
        </label>
        <input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
      </p>
      <p style={{ margin: 0 }}>
        <button
          className="button button--primary"
          type="submit"
          disabled={status === 'sending' || status === 'done'}
        >
          {status === 'sending' ? 'Changement' : 'Changer le mot de passe'}
        </button>
      </p>
      <p
        className={status === 'error' ? 'form__status form__status--error' : 'form__status'}
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
    </form>
  );
}
