'use client';

import { useState } from 'react';

// Two forms in one component, because they are two halves of one errand: ask
// for the link, then use it. A client who has lost their password is already
// having a bad day; they should not have to find a second page.
export default function ResetForm({ token }: { token: string | null }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!token) {
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
          setStatus('sending');
          const response = await fetch('/api/admin/reset', { method: 'POST' });
          const body = (await response.json()) as { message?: string };
          setStatus('done');
          setMessage(body.message ?? 'Demande enregistrée.');
        }}
      >
        <p>
          Un lien sera envoyé à l’adresse e-mail affichée sur votre site, celle que vos clients
          utilisent. Il est valable trente minutes et ne sert qu’une fois.
        </p>
        <p style={{ margin: 0 }}>
          <button className="button button--primary" type="submit" disabled={status !== 'idle'}>
            {status === 'sending' ? 'Envoi' : 'Recevoir un lien'}
          </button>
        </p>
        <p className="form__status" role="status" aria-live="polite">
          {message}
        </p>
      </form>
    );
  }

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
        const data = new FormData(event.currentTarget);
        const password = String(data.get('password') ?? '');
        if (password !== String(data.get('confirm') ?? '')) {
          setStatus('error');
          setMessage('Les deux mots de passe ne sont pas identiques.');
          return;
        }

        setStatus('sending');
        const response = await fetch('/api/admin/reset', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const body = (await response.json()) as { ok: boolean; error?: string };
        if (response.ok && body.ok) {
          setStatus('done');
          setMessage('Mot de passe enregistré. Vous pouvez vous connecter.');
          window.setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
          return;
        }
        setStatus('error');
        setMessage(body.error ?? 'Refusé.');
      }}
    >
      <p className="field">
        <label className="field__label" htmlFor="password">
          Nouveau mot de passe
        </label>
        <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" />
        <span className="admin-field__hint">Au moins 12 caractères.</span>
      </p>
      <p className="field">
        <label className="field__label" htmlFor="confirm">
          Répéter le mot de passe
        </label>
        <input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
      </p>
      <p style={{ margin: 0 }}>
        <button className="button button--primary" type="submit" disabled={status === 'sending' || status === 'done'}>
          {status === 'sending' ? 'Enregistrement' : 'Enregistrer'}
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
