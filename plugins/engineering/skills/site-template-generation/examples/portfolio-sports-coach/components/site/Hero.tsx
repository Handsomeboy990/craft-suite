'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { PortfolioContent } from '@/lib/types';
import { motionEnabled } from '@/lib/motion';
import Parallax from './Parallax';

// Full bleed, and the only place the page is allowed to be loud. The entrance
// runs once on load when the trade's signature carries it; the class is added
// by this script, so without it the first screen is simply there.
export default function Hero({
  hero,
  entrance,
  parallax,
}: {
  hero: PortfolioContent['hero'];
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
      <Parallax className="hero__media" enabled={parallax}>
        <Image src={hero.image.src} alt={hero.image.alt} fill sizes="100vw" priority />
      </Parallax>
      <div className={started ? 'page hero__body entrance is-running' : 'page hero__body'}>
        <h1 id="hero-title" className="hero__title" style={{ '--i': 0 } as React.CSSProperties}>
          {hero.title}
        </h1>
        {hero.subtitle ? (
          <p className="hero__subtitle" style={{ '--i': 1 } as React.CSSProperties}>
            {hero.subtitle}
          </p>
        ) : null}
        {hero.actions && hero.actions.length > 0 ? (
          <p className="hero__actions" style={{ '--i': 2 } as React.CSSProperties}>
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
    </section>
  );
}
