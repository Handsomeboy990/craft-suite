'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { send, t, toast, useOnline, useUi } from './ui';

export type FormField = {
  key: string;
  label: string;
  kind: 'text' | 'longtext' | 'email' | 'phone' | 'date' | 'int' | 'money' | 'select' | 'boolean';
  required?: boolean;
  options?: { value: string; label: string }[];
  value?: string;
};

// One form for every create and every edit, generated from the module's field
// declaration. The server is the authority: its refusal is shown on the field
// it names, tied to it by aria-describedby and announced as an alert.
export function RecordForm({
  url,
  method,
  fields,
  submitLabel,
  done,
  next,
}: {
  url: string;
  method: 'POST' | 'PATCH';
  fields: FormField[];
  submitLabel: string;
  done: string;
  next: string;
}) {
  const { ui, csrf } = useUi();
  const online = useOnline();
  const router = useRouter();
  // One key per form: a double click or a retried request creates one record.
  const [key] = useState(() => crypto.randomUUID());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ field?: string; text: string } | null>(null);
  const [setupLink, setSetupLink] = useState<string | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty.current) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    for (const field of fields) {
      values[field.key] = field.kind === 'boolean' ? data.get(field.key) === 'on' : String(data.get(field.key) ?? '');
    }
    setPending(true);
    setError(null);
    const { status, data: answer } = await send(
      csrf,
      url,
      method,
      values,
      method === 'POST' ? { 'idempotency-key': key } : {},
    );
    setPending(false);
    if (status === 401) return;
    if (status >= 200 && status < 300) {
      dirty.current = false;
      toast(done);
      const item = answer.item as { id?: number } | undefined;
      if (typeof answer.setup === 'string') {
        setSetupLink(`${window.location.origin}${answer.setup}`);
        return;
      }
      router.push(next.replace('{id}', String(item?.id ?? '')));
      router.refresh();
      return;
    }
    const code = String(answer.error ?? 'server');
    setError({ field: answer.field as string | undefined, text: t(ui, `errors.${code}`) });
  }

  if (setupLink) {
    return (
      <div className="panel" role="status">
        <p>{t(ui, 'forms.setupLink')}</p>
        <p>
          <code className="setup-link">{setupLink}</code>
        </p>
      </div>
    );
  }

  const fieldError = (name: string) => (error?.field === name ? 'form-error-message' : undefined);

  return (
    <form className="record-form" onSubmit={submit} onChange={() => (dirty.current = true)} noValidate>
      {error ? (
        <div role="alert" className="form-error" id="form-error-message">
          <p>{t(ui, 'forms.errorSummary')}</p>
          <p>
            {error.field ? `${fields.find((field) => field.key === error.field)?.label ?? error.field}: ` : ''}
            {error.text}
          </p>
        </div>
      ) : null}
      {fields.map((field) => {
        const id = `field-${field.key}`;
        const invalid = error?.field === field.key || undefined;
        if (field.kind === 'boolean') {
          return (
            <div className="field" key={field.key}>
              <label className="check">
                <input type="checkbox" name={field.key} defaultChecked={field.value === 'true'} /> {field.label}
              </label>
            </div>
          );
        }
        return (
          <div className="field" key={field.key}>
            <label htmlFor={id}>
              {field.label}
              {field.required ? <span className="required"> ({t(ui, 'forms.required')})</span> : null}
            </label>
            {field.kind === 'date' ? <span className="hint" id={`${id}-hint`}>{t(ui, 'filters.dateHint')}</span> : null}
            {field.kind === 'select' ? (
              <select
                id={id}
                name={field.key}
                defaultValue={field.value ?? ''}
                aria-invalid={invalid}
                aria-describedby={fieldError(field.key)}
              >
                {field.required ? null : <option value="">{t(ui, 'filters.none')}</option>}
                {(field.options ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.kind === 'longtext' ? (
              <textarea
                id={id}
                name={field.key}
                defaultValue={field.value ?? ''}
                rows={4}
                aria-invalid={invalid}
                aria-describedby={fieldError(field.key)}
              />
            ) : (
              <input
                id={id}
                name={field.key}
                type={field.kind === 'date' ? 'date' : field.kind === 'email' ? 'email' : field.kind === 'phone' ? 'tel' : 'text'}
                inputMode={field.kind === 'int' ? 'numeric' : field.kind === 'money' ? 'decimal' : undefined}
                defaultValue={field.value ?? ''}
                aria-invalid={invalid}
                aria-describedby={[fieldError(field.key), field.kind === 'date' ? `${id}-hint` : undefined].filter(Boolean).join(' ') || undefined}
              />
            )}
          </div>
        );
      })}
      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={pending || !online} aria-describedby={online ? undefined : 'offline-reason'}>
          {pending ? t(ui, 'forms.saving') : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function LoginForm({ next, expired }: { next: string; expired: boolean }) {
  const { ui } = useUi();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier: data.get('identifier'), password: data.get('password') }),
    }).catch(() => null);
    setPending(false);
    if (response?.ok) {
      window.location.assign(next);
      return;
    }
    setError(t(ui, response?.status === 429 ? 'login.limited' : response ? 'login.refused' : 'errors.offline'));
  }
  return (
    <form className="record-form" onSubmit={submit} noValidate>
      {expired ? (
        <p className="banner banner--info" role="status">
          {t(ui, 'states.expired')}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="form-error" id="login-error">
          {error}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="identifier">{t(ui, 'login.identifier')}</label>
        <input id="identifier" name="identifier" type="email" autoComplete="username" required aria-describedby={error ? 'login-error' : undefined} />
      </div>
      <div className="field">
        <label htmlFor="password">{t(ui, 'login.password')}</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={pending}>
          {pending ? t(ui, 'login.submitting') : t(ui, 'login.submit')}
        </button>
      </div>
    </form>
  );
}

export function SetupForm({ token }: { token: string }) {
  const { ui } = useUi();
  const [state, setState] = useState<'idle' | 'pending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState('pending');
    const response = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, password: data.get('password') }),
    }).catch(() => null);
    const answer = (await response?.json().catch(() => ({}))) as { error?: string } | undefined;
    if (response?.ok) {
      setState('done');
      return;
    }
    setState('idle');
    setError(t(ui, `setup.${answer?.error === 'short' ? 'short' : 'invalid'}`));
  }
  if (state === 'done') {
    return (
      <p role="status">
        {t(ui, 'setup.done')} <a href="/login">{t(ui, 'login.submit')}</a>
      </p>
    );
  }
  return (
    <form className="record-form" onSubmit={submit} noValidate>
      {error ? (
        <p role="alert" className="form-error" id="setup-error">
          {error}
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="password">{t(ui, 'setup.password')}</label>
        <input id="password" name="password" type="password" autoComplete="new-password" aria-describedby={error ? 'setup-error' : undefined} />
      </div>
      <div className="form-actions">
        <button type="submit" className="button button--primary" disabled={state === 'pending'}>
          {t(ui, 'setup.submit')}
        </button>
      </div>
    </form>
  );
}

// The settings form: every field of /api/admin/fields, saved as one patch of
// the fields that changed.
export function SettingsForm({ fields }: { fields: { path: string; label: string; kind: string; value: string; section: string }[] }) {
  const { ui, csrf } = useUi();
  const online = useOnline();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ field?: string; text: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const patch: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = field.kind === 'boolean' ? (data.get(field.path) === 'on' ? 'true' : 'false') : String(data.get(field.path) ?? '');
      if (raw === field.value) continue;
      patch[field.path] = field.kind === 'number' ? Number(raw) : field.kind === 'boolean' ? raw === 'true' : raw;
    }
    if (Object.keys(patch).length === 0) return;
    setPending(true);
    setError(null);
    const { status, data: answer } = await send(csrf, '/api/admin/content', 'PUT', { patch });
    setPending(false);
    if (status === 401) return;
    if (status >= 200 && status < 300) {
      toast(t(ui, 'settings.saved'));
      router.refresh();
      return;
    }
    setError({ field: answer.field as string | undefined, text: `${answer.field ?? ''} ${String(answer.error ?? '')}`.trim() });
  }
  const sections = Array.from(new Set(fields.map((field) => field.section)));
  return (
    <form className="record-form settings-form" onSubmit={submit} noValidate>
      {error ? (
        <div role="alert" className="form-error" id="settings-error">
          <p>{t(ui, 'forms.errorSummary')}</p>
          <p>{error.text}</p>
        </div>
      ) : null}
      {sections.map((section) => (
        <fieldset key={section} className="settings-group">
          <legend>{section}</legend>
          {fields
            .filter((field) => field.section === section)
            .map((field) => {
              const id = `setting-${field.path.replace(/\./g, '-')}`;
              const invalid = error?.field === field.path || undefined;
              return (
                <div className="field" key={field.path}>
                  <label htmlFor={id}>{field.label}</label>
                  {field.kind === 'boolean' ? (
                    <input id={id} name={field.path} type="checkbox" defaultChecked={field.value === 'true'} />
                  ) : field.kind === 'longtext' ? (
                    <textarea id={id} name={field.path} defaultValue={field.value} rows={3} aria-invalid={invalid} aria-describedby={invalid ? 'settings-error' : undefined} />
                  ) : (
                    <input
                      id={id}
                      name={field.path}
                      defaultValue={field.value}
                      inputMode={field.kind === 'number' ? 'decimal' : undefined}
                      aria-invalid={invalid}
                      aria-describedby={invalid ? 'settings-error' : undefined}
                    />
                  )}
                </div>
              );
            })}
        </fieldset>
      ))}
      <div className="form-actions form-actions--sticky">
        <button type="submit" className="button button--primary" disabled={pending || !online}>
          {pending ? t(ui, 'forms.saving') : t(ui, 'settings.save')}
        </button>
      </div>
    </form>
  );
}

export function RestoreButton({ snapshot, label }: { snapshot: string; label: string }) {
  const { ui, csrf } = useUi();
  const router = useRouter();
  const online = useOnline();
  return (
    <button
      type="button"
      className="button"
      aria-label={label}
      disabled={!online}
      onClick={async () => {
        const { status } = await send(csrf, '/api/admin/history', 'POST', { snapshot });
        if (status === 200) {
          toast(t(ui, 'settings.restored'));
          router.refresh();
        } else if (status !== 401) toast(t(ui, 'errors.server'), 'danger');
      }}
    >
      {t(ui, 'settings.restore')}
    </button>
  );
}
