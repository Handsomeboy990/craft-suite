'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// The reveal. The hidden state is added by this script and never by the
// stylesheet, so a browser without IntersectionObserver, a visitor who asked
// for reduced motion, and an instance whose motion intensity is 0 all see the
// content immediately instead of a blank page.
export default function Reveal({
  children,
  className,
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const duration = getComputedStyle(document.documentElement).getPropertyValue('--motion-duration');
    if (parseFloat(duration) === 0) return;

    node.classList.add('reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={[className, stagger ? 'stagger' : null].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
