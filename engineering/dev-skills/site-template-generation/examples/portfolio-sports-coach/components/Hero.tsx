import Image from 'next/image';
import type { PortfolioContent } from '@/lib/types';

export default function Hero({ hero }: { hero: PortfolioContent['hero'] }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <Image src={hero.image.src} alt={hero.image.alt} fill sizes="100vw" priority />
      </div>
      <div className="container hero__body reveal">
        <h1 id="hero-title" className="hero__title">
          {hero.title}
        </h1>
        {hero.subtitle ? <p className="hero__subtitle">{hero.subtitle}</p> : null}
        {hero.actions && hero.actions.length > 0 ? (
          <p className="hero__actions">
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
