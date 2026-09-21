'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import type { ShowcaseContent } from '@/lib/types';
import { motionEnabled } from '@/lib/motion';
import Parallax from './Parallax';

// A full bleed band, split rather than stacked: a trade site states what it does
// and shows the work at the same time. The entrance and the parallax only exist
// where the trade's signature carries them, which for a technical trade it does
// not.
export default function Hero({
  hero,
  entrance,
  parallax,
}: {
  hero: ShowcaseContent['home']['hero'];
  entrance: boolean;
  parallax: boolean;
}) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!entrance || !motionEnabled()) return;
    const frame = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(frame);
  }, [entrance]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="page hero__grid">
        <div className={started ? 'entrance is-running' : undefined}>
          <h1 id="hero-title" className="hero__title" style={{ '--i': 0 } as CSSProperties}>
            {hero.title}
          </h1>
          {hero.subtitle ? (
            <p className="hero__subtitle" style={{ '--i': 1 } as CSSProperties}>
              {hero.subtitle}
            </p>
          ) : null}
          {hero.actions && hero.actions.length > 0 ? (
            <p className="hero__actions" style={{ '--i': 2 } as CSSProperties}>
              {hero.actions.map((action) => (
                <a
                  key={action.href + action.label}
                  className={`button button--${action.variant}`}
                  href={action.href}
                >
                  {action.label}
                </a>
              ))}
            </p>
          ) : null}
        </div>
        <Parallax className="hero__media" enabled={parallax}>
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            sizes="(min-width: 900px) 50vw, 100vw"
            priority
          />
        </Parallax>
      </div>
    </section>
  );
}
