'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { send, t, useUi } from './ui';

type Choice = 'system' | 'light' | 'dark';

// Three states: a person who chose nothing keeps following their system. The
// stored choice is applied before first paint by the script in the layout.
export function ThemeToggle() {
  const { ui } = useUi();
  const [choice, setChoice] = useState<Choice>('system');
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') setChoice(stored);
    } catch {
      // Storage refused: the system theme still applies.
    }
  }, []);
  function apply(next: Choice) {
    setChoice(next);
    const root = document.documentElement;
    if (next === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', next);
    try {
      if (next === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', next);
    } catch {
      // The choice holds for this page only.
    }
  }
  const order: Choice[] = ['system', 'light', 'dark'];
  const labels: Record<Choice, string> = {
    system: t(ui, 'shell.themeSystem'),
    light: t(ui, 'shell.themeLight'),
    dark: t(ui, 'shell.themeDark'),
  };
  return (
    <button
      type="button"
      className="button button--quiet"
      data-theme-toggle={choice}
      aria-label={`${t(ui, 'shell.themeLabel')}: ${labels[choice]}`}
      onClick={() => apply(order[(order.indexOf(choice) + 1) % order.length]!)}
    >
      {labels[choice]}
    </button>
  );
}

export function SignOutButton() {
  const { ui, csrf } = useUi();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      className="button button--quiet"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await send(csrf, '/api/admin/logout', 'POST');
        window.location.assign('/login');
      }}
    >
      {t(ui, 'shell.signOut')}
    </button>
  );
}

// The rail is fixed from the wide breakpoint up. Below it, the same rail is a
// real dialog: the button names it and says whether it is open, focus moves
// into it and stays there, Escape and the overlay close it, and focus returns
// to the button.
export function NavDrawer({ children }: { children: ReactNode }) {
  const { ui } = useUi();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const wasOpen = useRef(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const first = panel.current?.querySelector<HTMLElement>('a, button');
      first?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      button.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>('a, button'));
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        className="button button--quiet drawer-button"
        aria-expanded={open}
        aria-controls="navigation-rail"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? t(ui, 'shell.menuClose') : t(ui, 'shell.menuOpen')}
      </button>
      {open ? <div className="drawer-overlay" aria-hidden="true" onClick={() => setOpen(false)} /> : null}
      <div
        ref={panel}
        id="navigation-rail"
        className={open ? 'rail rail--open' : 'rail'}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-label={open ? t(ui, 'shell.navLabel') : undefined}
      >
        {children}
      </div>
    </>
  );
}
