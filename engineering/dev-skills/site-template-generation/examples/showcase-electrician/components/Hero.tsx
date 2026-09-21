import Image from 'next/image';
import type { ShowcaseContent } from '@/lib/types';

export default function Hero({ hero }: { hero: ShowcaseContent['home']['hero'] }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__body">
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
        <div className="hero__media">
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            sizes="(min-width: 960px) 50vw, 100vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
