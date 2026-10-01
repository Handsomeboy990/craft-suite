import type { ReactNode } from 'react';
import { fill } from '@/lib/config';
import { toneOf, type Tone } from '@/lib/status';
import type { Config } from '@/lib/types';

// Small server pieces shared by every screen. Every word comes from the
// configuration; every colour from a token through a class.

// A status is a badge carrying its word. The icon differs by tone so that the
// state is told by shape and text as well as colour; it is decoration only.
export function StatusIcon({ tone }: { tone: Tone }) {
  const shapes: Record<Tone, ReactNode> = {
    success: <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" />,
    warning: <path d="M8 2l6.5 12h-13z" fill="none" stroke="currentColor" strokeWidth="1.6" />,
    danger: <path d="M5 1.5h6l3.5 3.5v6l-3.5 3.5h-6l-3.5-3.5v-6z" fill="none" stroke="currentColor" strokeWidth="1.6" />,
    info: <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />,
    neutral: <rect x="3" y="3" width="10" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />,
  };
  return (
    <svg className="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      {shapes[tone]}
    </svg>
  );
}

export function Badge({ config, set, value }: { config: Config; set: string; value: string }) {
  const tone = toneOf(set, value);
  return (
    <span className={`badge badge--${tone}`} data-status={value}>
      <StatusIcon tone={tone} />
      {config.statuses[set]?.[value] ?? value}
    </span>
  );
}

export function PageHeader({
  title,
  intro,
  stamp,
  action,
}: {
  title: string;
  intro?: string;
  stamp?: { text: string; time: string };
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        <h1>{title}</h1>
        {intro ? <p className="muted">{intro}</p> : null}
        {stamp ? (
          <p className="stamp" data-loaded-at={stamp.time}>
            {stamp.text}
          </p>
        ) : null}
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}

export function StatePanel({
  tone,
  title,
  children,
  role,
}: {
  tone: Tone;
  title: string;
  children?: ReactNode;
  role?: 'alert' | 'status';
}) {
  return (
    <section className={`state state--${tone}`} role={role} aria-label={title}>
      <p className="state__title">
        <StatusIcon tone={tone} />
        {title}
      </p>
      {children}
    </section>
  );
}

export function deniedText(config: Config, moduleName: string): string {
  return fill(config.ui.states!.denied!, { module: moduleName, grantor: config.ui.states!.grantor! });
}
