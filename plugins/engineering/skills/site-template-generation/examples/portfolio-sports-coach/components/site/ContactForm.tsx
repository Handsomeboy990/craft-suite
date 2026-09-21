'use client';

import { useState } from 'react';
import type { FormField, PortfolioContent } from '@/lib/types';

type Status = 'idle' | 'sending' | 'success' | 'error';

// The form posts to the site's own endpoint, which stores the message and shows
// it in the back office. A form that posts into nothing is the most common
// broken thing on a client site.
export default function ContactForm({
  fields,
  forms,
  ui,
}: {
  fields: FormField[];
  forms: PortfolioContent['forms'];
  ui: PortfolioContent['ui'];
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The element is captured before the first await. React clears the event
    // afterwards, and reading currentTarget later throws inside the try, which
    // showed the failure message for a submission the server had accepted and
    // stored. A visitor told their message failed sends it again or gives up.
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      payload[field.name] =
        field.type === 'checkbox' ? data.get(field.name) !== null : String(data.get(field.name) ?? '');
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { ok: boolean; error?: string; message?: string };
      if (response.ok && body.ok) {
        setStatus('success');
        setMessage(body.message ?? forms.successMessage);
        form.reset();
      } else {
        setStatus('error');
        setMessage(body.error ?? forms.errorMessage);
      }
    } catch {
      setStatus('error');
      setMessage(forms.errorMessage);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {fields.map((field) => {
        const id = `field-${field.name}`;

        if (field.type === 'checkbox') {
          return (
            <p key={field.name} className="field field--checkbox">
              <input id={id} name={field.name} type="checkbox" required={field.required} />
              <label className="field__label" htmlFor={id}>
                {field.label}
              </label>
            </p>
          );
        }

        return (
          <p key={field.name} className="field">
            <label className="field__label" htmlFor={id}>
              {field.label}
              {field.required ? null : <span className="field__hint"> ({ui.form.optionalHint})</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={id}
                name={field.name}
                rows={5}
                required={field.required}
                placeholder={field.placeholder}
              />
            ) : field.type === 'select' ? (
              <select id={id} name={field.name} required={field.required} defaultValue="">
                <option value="" disabled>
                  {ui.form.selectPlaceholder}
                </option>
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={field.name}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}
          </p>
        );
      })}

      <p style={{ margin: 0 }}>
        <button className="button button--primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? ui.form.sendingLabel : ui.form.submitLabel}
        </button>
      </p>

      <p
        className={status === 'error' ? 'form__status form__status--error' : 'form__status'}
        role="status"
        aria-live="polite"
      >
        {status === 'success' || status === 'error' ? message : null}
      </p>
    </form>
  );
}
