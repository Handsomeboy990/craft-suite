'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { send, t, toast, useOnline, useUi } from './ui';

// Every filter, the search, the sort and the page live in the query string.
// These controls only build the next URL and navigate to it; the server reads
// the URL and answers with the page. A reload, a shared link and the back
// button therefore land on the same list.

function nextUrl(base: string, current: string, changes: Record<string, string | null>): string {
  const params = new URLSearchParams(current);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export function FilterForm({
  base,
  current,
  keys,
  children,
}: {
  base: string;
  current: string;
  keys: string[];
  children: ReactNode;
}) {
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const changes: Record<string, string | null> = { page: null };
    for (const key of keys) {
      const value = String(data.get(key) ?? '');
      changes[key] = value === '' ? null : value;
    }
    router.push(nextUrl(base, current, changes));
  }
  return (
    <form className="filters" method="get" action={base} onSubmit={submit}>
      {children}
    </form>
  );
}

// Debounced, server side, with the field it searches named in its label.
export function SearchField({ base, current, label, value }: { base: string; current: string; label: string; value: string }) {
  const router = useRouter();
  const [text, setText] = useState(value);
  const timer = useRef<number | undefined>(undefined);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      router.replace(nextUrl(base, current, { q: text.trim() || null, page: null }));
    }, 400);
    return () => window.clearTimeout(timer.current);
    // The current URL changes after each navigation; only typing restarts it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <div className="field field--search">
      <label htmlFor="list-search">{label}</label>
      <input id="list-search" name="q" type="search" value={text} onChange={(event) => setText(event.target.value)} />
    </div>
  );
}

// The sort control is a button inside the header cell. The header carries
// aria-sort; the button names the column and the direction it will apply.
export function SortButton({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <button type="button" className="sort" aria-label={label} onClick={() => router.push(href)}>
      {children}
    </button>
  );
}

export type ActionField = {
  key: string;
  label: string;
  kind: 'text' | 'money' | 'select' | 'boolean';
  required?: boolean;
  options?: { value: string; label: string }[];
};

// A row action: a button named with its record. A destructive one asks once,
// names the record and the consequence, and puts the safe choice first. One
// that needs values asks for them in the same dialog. The result is announced
// and the list shows what the server answered, never an optimistic guess.
export function ActionButton({
  url,
  label,
  name,
  confirm,
  keep,
  submitLabel,
  done,
  fields,
  primary,
}: {
  url: string;
  label: string;
  name: string;
  confirm?: string;
  keep?: string;
  submitLabel?: string;
  done: string;
  fields?: ActionField[];
  primary?: boolean;
}) {
  const { ui, csrf } = useUi();
  const online = useOnline();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ field?: string; text: string } | null>(null);
  const needsDialog = Boolean(confirm) || Boolean(fields?.length);

  async function run(values: Record<string, unknown>) {
    setPending(true);
    setError(null);
    const { status, data } = await send(csrf, url, 'POST', values);
    setPending(false);
    if (status === 401) return;
    if (status >= 200 && status < 300) {
      dialog.current?.close();
      toast(done);
      router.refresh();
      return;
    }
    const code = String(data.error ?? 'server');
    const text = t(ui, `errors.${code}`);
    if (needsDialog && dialog.current?.open) setError({ field: data.field as string | undefined, text });
    else toast(text, 'danger');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    for (const field of fields ?? []) {
      values[field.key] = field.kind === 'boolean' ? data.get(field.key) === 'on' : String(data.get(field.key) ?? '');
    }
    void run(values);
  }

  return (
    <>
      <button
        type="button"
        className={primary ? 'button button--primary' : 'button'}
        aria-label={name}
        disabled={pending || !online}
        aria-describedby={online ? undefined : 'offline-reason'}
        onClick={() => {
          if (needsDialog) {
            setError(null);
            dialog.current?.showModal();
          } else void run({});
        }}
      >
        {label}
      </button>
      {needsDialog ? (
        <dialog ref={dialog} className="dialog" aria-labelledby={`${url}-title`}>
          <form method="dialog" onSubmit={submit} noValidate>
            <h2 id={`${url}-title`} className="dialog__title">
              {name}
            </h2>
            {confirm ? <p>{confirm}</p> : null}
            {error ? (
              <p role="alert" className="form-error" id={`${url}-error`}>
                {error.text}
              </p>
            ) : null}
            {(fields ?? []).map((field) => (
              <div className="field" key={field.key}>
                {field.kind === 'boolean' ? (
                  <label className="check">
                    <input type="checkbox" name={field.key} /> {field.label}
                  </label>
                ) : (
                  <>
                    <label htmlFor={`${url}-${field.key}`}>
                      {field.label}
                      {field.required ? <span className="required"> ({t(ui, 'forms.required')})</span> : null}
                    </label>
                    {field.kind === 'select' ? (
                      <select
                        id={`${url}-${field.key}`}
                        name={field.key}
                        required={field.required}
                        aria-invalid={error?.field === field.key || undefined}
                        aria-describedby={error?.field === field.key ? `${url}-error` : undefined}
                      >
                        {(field.options ?? []).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`${url}-${field.key}`}
                        name={field.key}
                        inputMode={field.kind === 'money' ? 'decimal' : undefined}
                        required={field.required}
                        aria-invalid={error?.field === field.key || undefined}
                        aria-describedby={error?.field === field.key ? `${url}-error` : undefined}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
            <div className="dialog__actions">
              <button type="button" className="button" autoFocus onClick={() => dialog.current?.close()}>
                {keep ?? t(ui, 'forms.cancel')}
              </button>
              <button type="submit" className={confirm ? 'button button--danger' : 'button button--primary'} disabled={pending || !online}>
                {pending ? t(ui, 'forms.saving') : (submitLabel ?? label)}
              </button>
            </div>
          </form>
        </dialog>
      ) : null}
    </>
  );
}

export function RetryButton() {
  const { ui } = useUi();
  const router = useRouter();
  return (
    <button type="button" className="button" onClick={() => router.refresh()}>
      {t(ui, 'states.retry')}
    </button>
  );
}
