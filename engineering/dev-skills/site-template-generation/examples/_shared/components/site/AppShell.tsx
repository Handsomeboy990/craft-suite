'use client';

import { useEffect, useState } from 'react';
// The strings this shell reads, passed in by the instance with the rest of its
// ui strings. Absent, the install prompt is never offered.
export type AppShellStrings = { install?: { label: string; dismiss: string } };

type InstallEvent = Event & { prompt: () => Promise<void> };

// Registers the service worker and offers the install prompt. Everything here
// is optional at runtime: a browser without service workers, or one that never
// fires the install event, gets the whole site minus the extra.
export default function AppShell({ enabled, ui }: { enabled: boolean; ui: AppShellStrings }) {
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!enabled || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('service worker registration failed', error);
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ui.install) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, [enabled, ui.install]);

  if (!install || dismissed || !ui.install) return null;

  return (
    <div className="install-prompt" role="dialog" aria-label={ui.install.label}>
      <p>{ui.install.label}</p>
      <button
        type="button"
        className="button button--primary"
        onClick={() => {
          void install.prompt();
          setInstall(null);
        }}
      >
        {ui.install.label}
      </button>
      <button type="button" className="button button--ghost" onClick={() => setDismissed(true)}>
        {ui.install.dismiss}
      </button>
    </div>
  );
}
