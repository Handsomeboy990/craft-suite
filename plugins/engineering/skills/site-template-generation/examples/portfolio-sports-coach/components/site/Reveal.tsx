'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motionEnabled } from '@/lib/motion';

// The reveal, and the stagger that goes with it. The hidden state is added by
// this script and never by the stylesheet, so a browser without
// IntersectionObserver, a visitor who asked for reduced motion, and an instance
// whose intensity is 0 all see the content immediately.
//
// `stagger` puts the delay on each item through its own `--i`, which is the
// difference between a list that arrives in sequence and one that arrives as a
// block. Putting it on the container animates nothing and looks static.
export default function Reveal({
  children,
  className,
  stagger = false,
  enabled = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  enabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    if (!('IntersectionObserver' in window) || !motionEnabled()) return;

    node.classList.add('motion-on');
    if (stagger) node.classList.add('motion-stagger');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
