import type { PortfolioContent } from '@/lib/types';

type Offers = NonNullable<PortfolioContent['offers']>;

export default function Offers({ offers }: { offers: Offers }) {
  return (
    <section id="offers" className="section" aria-labelledby="offers-title">
      <div className="container">
        <h2 id="offers-title" className="section__title">
          {offers.heading}
        </h2>
        <ul className="cards">
          {offers.items.map((offer) => (
            <li
              key={offer.title}
              className={offer.highlight ? 'card card--highlight reveal' : 'card reveal'}
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
      </div>
    </section>
  );
}
