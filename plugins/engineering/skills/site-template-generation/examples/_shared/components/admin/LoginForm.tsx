'use client';

import { useState } from 'react';

export default function LoginForm({ next }: { next: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [message, setMessage] = useState('');

  return (
    <form
      // Submission is handled in JavaScript. The method is still declared, because
      // a form with no method falls back to GET, and a GET puts everything typed
      // here into the URL: the server log, the browser history, the Referer sent
      // to the next site. A password or a visitor message must never travel there.
      method="post"
      className="form"
      onSubmit={async (event) => {
        event.preventDefault();
        const password = new FormData(event.currentTarget).get('password');
        setStatus('sending');
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const body = (await response.json()) as { ok: boolean; error?: string };
        if (response.ok && body.ok) {
          window.location.href = next;
          return;
        }
        setStatus('error');
        setMessage(body.error ?? 'Refusé.');
      }}
    >
      <noscript>
        <p className="form__status form__status--error">
          Cet espace a besoin de JavaScript. Activez-le dans votre navigateur, puis rechargez
          cette page.
        </p>
      </noscript>
      <p className="field">
        <label className="field__label" htmlFor="password">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </p>
      <p style={{ margin: 0 }}>
        <button className="button button--primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Vérification' : 'Entrer'}
        </button>
      </p>
      <p className="form__status form__status--error" role="status" aria-live="polite">
        {status === 'error' ? message : null}
      </p>
    </form>
  );
}
