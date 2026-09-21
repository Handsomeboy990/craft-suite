import type { CSSProperties } from 'react';
import type { PortfolioContent } from '@/lib/types';
import Reveal from './Reveal';

type Offers = NonNullable<PortfolioContent['offers']>;

export default function Offers({ offers, stagger }: { offers: Offers; stagger: boolean }) {
  return (
    <section id="offers" className="section" aria-labelledby="offers-title">
      <div className="page">
        <div className="section__head">
          <h2 id="offers-title" className="section__title">
            {offers.heading}
          </h2>
        </div>
        <Reveal stagger={stagger}>
          <ul className="grid grid--cards">
            {offers.items.map((offer, index) => (
              <li
                key={offer.title}
                className={offer.highlight ? 'card card--highlight reveal-item' : 'card reveal-item'}
                style={{ '--i': index } as CSSProperties}
              >
                <h3 className="card__title">{offer.title}</h3>
                <p className="card__body">{offer.description}</p>
                <p className="card__meta">
                  <span className="card__price">{offer.price}</span>
                  <span className="card__duration">{offer.duration}</span>
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
