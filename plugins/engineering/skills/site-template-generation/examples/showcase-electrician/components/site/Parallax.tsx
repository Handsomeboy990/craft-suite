'use client';

import { useEffect, type ReactNode } from 'react';
import { motionEnabled } from '@/lib/motion';

// One scroll listener for the page, writing one custom property. The element
// that moves does so on transform, which the compositor handles without a
// layout pass. Off, it writes nothing and the image sits still.
export default function Parallax({
  children,
  className,
  enabled,
}: {
  children: ReactNode;
  className?: string;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled || !motionEnabled()) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = Math.min(window.scrollY, window.innerHeight) * 0.25;
      document.documentElement.style.setProperty('--parallax', `${offset.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty('--parallax');
    };
  }, [enabled]);

  return <div className={className}>{children}</div>;
}
