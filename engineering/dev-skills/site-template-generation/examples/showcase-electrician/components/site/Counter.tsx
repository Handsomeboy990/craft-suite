'use client';

import { useEffect, useRef, useState } from 'react';
import { motionEnabled } from '@/lib/motion';

// Counts to the value the content wrote, keeping whatever is not a number:
// "8 sem." counts the 8 and keeps " sem.", and "a partir de 240" is left alone
// because it does not start with one. Without motion the value is simply there.
export default function Counter({ value, enabled }: { value: string; enabled: boolean }) {
  const match = /^(\d[\d\s.,]*)(.*)$/.exec(value.trim());
  const target = match ? Number(match[1]!.replace(/[\s,]/g, '')) : NaN;
  const suffix = match ? match[2] : '';

  const [shown, setShown] = useState<string>(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled || Number.isNaN(target)) return;
    if (!('IntersectionObserver' in window) || !motionEnabled()) return;

    const duration = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--motion-duration'),
    ) * 3;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const started = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - started) / duration, 1);
          // Fast at first, settling at the end: a counter that runs linearly
          // reads like a loading bar rather than an arrival.
          const eased = 1 - Math.pow(1 - progress, 3);
          setShown(`${Math.round(target * eased)}${suffix}`);
          if (progress < 1) requestAnimationFrame(step);
        };
        setShown(`0${suffix}`);
        requestAnimationFrame(step);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, suffix, target]);

  return <span ref={ref}>{shown}</span>;
}
