'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';

// The interface strings the client components need, the CSRF token of the
// session, and the time the page's data was read. Passed once by the layout
// from the configuration; no client component carries a word of its own.

export type Ui = Record<string, Record<string, string>>;

type Value = { ui: Ui; csrf: string; loadedAt: string };

const Context = createContext<Value>({ ui: {}, csrf: '', loadedAt: '' });

export function UiProvider({ ui, csrf, loadedAt, children }: Value & { children: ReactNode }) {
  return <Context.Provider value={{ ui, csrf, loadedAt }}>{children}</Context.Provider>;
}

export function useUi(): Value {
  return useContext(Context);
}

export function t(ui: Ui, path: string, values: Record<string, string | number> = {}): string {
  const [group, key] = path.split('.') as [string, string];
  const template = ui[group]?.[key] ?? path;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}

// ---------------------------------------------------------------------------
// Online state, shared by the banner and every write control.

function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

// ---------------------------------------------------------------------------
// Toasts: success in a polite live region, failure as an alert.

type Toast = { id: number; text: string; tone: 'success' | 'danger' };

export function toast(text: string, tone: Toast['tone'] = 'success'): void {
  window.dispatchEvent(new CustomEvent('dashboard-toast', { detail: { text, tone } }));
}

export function Toaster() {
  const { ui } = useUi();
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    let next = 1;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ text: string; tone: Toast['tone'] }>).detail;
      const id = next++;
      setItems((current) => [...current.slice(-2), { id, ...detail }]);
      window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 8000);
    };
    window.addEventListener('dashboard-toast', handler);
    return () => window.removeEventListener('dashboard-toast', handler);
  }, []);
  const polite = items.filter((item) => item.tone === 'success');
  const urgent = items.filter((item) => item.tone === 'danger');
  return (
    <div className="toasts">
      <div role="status" aria-live="polite" className="toasts__region" data-toasts="polite">
        {polite.map((item) => (
          <p key={item.id} className="toast toast--success">
            {item.text}
          </p>
        ))}
      </div>
      <div role="alert" className="toasts__region" data-toasts="alert">
        {urgent.map((item) => (
          <p key={item.id} className="toast toast--danger">
            {item.text}
            <button type="button" className="toast__close" onClick={() => setItems((all) => all.filter((x) => x.id !== item.id))}>
              {t(ui, 'forms.close')}
            </button>
          </p>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The offline banner: says so, gives the age of the data on screen, and that
// changes are paused. Write controls read the same state and are disabled.

export function OfflineBanner() {
  const { ui, loadedAt } = useUi();
  const online = useOnline();
  if (online) return null;
  // The age of the data actually on screen: each page stamps the time it was
  // read on the server, and the banner quotes the latest stamp.
  const stamps = typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll('[data-loaded-at]'));
  const time = stamps.length ? stamps[stamps.length - 1]!.getAttribute('data-loaded-at') ?? loadedAt : loadedAt;
  return (
    <div className="banner banner--warning" role="status" id="offline-reason">
      {t(ui, 'states.offline', { time })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// The service worker: shell assets and the offline page only, never a record.

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Without a worker the dashboard works online; the offline page is
        // simply not available.
      });
    }
  }, []);
  return null;
}

// A 401 from any call: the session ended. Sign in, then come back here.
export function goToSignIn(): void {
  const next = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?expired=1&next=${encodeURIComponent(next)}`);
}

export async function send(
  csrf: string,
  url: string,
  method: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {},
): Promise<{ status: number; data: Record<string, unknown> }> {
  const response = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', 'x-csrf-token': csrf, ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 401) {
    goToSignIn();
    return { status: 401, data: {} };
  }
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: response.status, data };
}
