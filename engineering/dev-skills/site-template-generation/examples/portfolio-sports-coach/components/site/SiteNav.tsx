'use client';

import { useEffect, useRef, useState } from 'react';
import type { PortfolioContent } from '@/lib/types';

// A navigation that does not fit becomes a menu, not a wrapping row. The button
// exists only below the breakpoint, where the stylesheet shows it; above it the
// panel is a plain row and this component adds nothing to the markup a visitor
// meets.
export default function SiteNav({
  nav,
  ui,
}: {
  nav: PortfolioContent['nav'];
  ui: PortfolioContent['ui'];
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panel.current?.contains(target) || button.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen(!open)}
      >
        <span className="nav-toggle__bars" aria-hidden="true" />
        {open ? ui.menuClose : ui.menuOpen}
      </button>

      <div ref={panel} id="site-nav" className="site-nav" data-open={open}>
        <nav aria-label={ui.primaryNavLabel}>
          <ul className="site-nav__list">
            {nav.map((entry) => (
              <li key={entry.href}>
                <a href={entry.href} onClick={() => setOpen(false)}>
                  {entry.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
