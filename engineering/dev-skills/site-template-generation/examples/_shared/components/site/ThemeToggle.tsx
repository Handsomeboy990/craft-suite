'use client';

import { useEffect, useState } from 'react';
// The strings this control reads. Each instance passes its own ui strings,
// which carry these keys among others; the control never imports the content
// model of any one of them.
export type ThemeToggleStrings = {
  themeToggleLabel: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
};

type Choice = 'system' | 'light' | 'dark';

// Three states, because a visitor who has chosen nothing should keep following
// their system. The stored choice is applied before first paint by the inline
// script in the layout, so the page never flashes the wrong theme.
export default function ThemeToggle({ ui }: { ui: ThemeToggleStrings }) {
  const [choice, setChoice] = useState<Choice>('system');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') setChoice(stored);
    } catch {
      // A browser refusing storage keeps the system theme, which still works.
    }
  }, []);

  function apply(next: Choice) {
    setChoice(next);
    try {
      if (next === 'system') {
        localStorage.removeItem('theme');
        document.documentElement.removeAttribute('data-theme');
      } else {
        localStorage.setItem('theme', next);
        document.documentElement.setAttribute('data-theme', next);
      }
    } catch {
      if (next === 'system') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', next);
    }
  }

  const order: Choice[] = ['system', 'light', 'dark'];
  const labels: Record<Choice, string> = {
    system: ui.themeSystem,
    light: ui.themeLight,
    dark: ui.themeDark,
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`${ui.themeToggleLabel} : ${labels[choice]}`}
      onClick={() => apply(order[(order.indexOf(choice) + 1) % order.length]!)}
    >
      {labels[choice]}
    </button>
  );
}
