'use client';

import { useState } from 'react';
import type { FormField, ShowcaseContent } from '@/lib/types';

type Props = {
  fields: FormField[];
  forms: ShowcaseContent['forms'];
  ui: ShowcaseContent['ui'];
  fallbackEmail: string;
};

type Status = 'idle' | 'sending' | 'success' | 'error';

// Static export means there is no server here. The form posts to the endpoint
// declared in the content file and falls back to a mailto when none is set.
// Both paths end in a visible outcome.
export default function QuoteForm({ fields, forms, ui, fallbackEmail }: Props) {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    if (!forms.endpoint) {
      const body = fields
        .map((field) => `${field.label}: ${String(data.get(field.name) ?? '')}`)
        .join('\n');
      window.location.href = `mailto:${fallbackEmail}?subject=${encodeURIComponent(
        document.title,
      )}&body=${encodeURIComponent(body)}`;
      setStatus('success');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch(forms.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      setStatus(response.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {fields.map((field) => {
        const id = `field-${field.name}`;

        if (field.type === 'checkbox') {
          return (
            <p key={field.name} className="form__row form__row--checkbox">
              <input id={id} name={field.name} type="checkbox" required={field.required} />
              <label className="form__label" htmlFor={id}>
                {field.label}
              </label>
            </p>
          );
        }

        return (
          <p key={field.name} className="form__row">
            <label className="form__label" htmlFor={id}>
              {field.label}
              {field.required ? null : (
                <span className="form__hint"> ({ui.form.optionalHint})</span>
              )}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={id}
                name={field.name}
                rows={6}
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

      <p className="form__actions">
        <button className="button button--primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? ui.form.sendingLabel : ui.form.submitLabel}
        </button>
      </p>

      <p className="form__status" role="status" aria-live="polite">
        {status === 'success' ? forms.successMessage : null}
        {status === 'error' ? (
          <span className="form__status--error">{forms.errorMessage}</span>
        ) : null}
      </p>
    </form>
  );
}
