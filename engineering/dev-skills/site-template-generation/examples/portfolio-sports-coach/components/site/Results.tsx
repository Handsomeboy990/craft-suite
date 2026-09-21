import type { CSSProperties } from 'react';
import type { PortfolioContent } from '@/lib/types';
import Reveal from './Reveal';

type Results = NonNullable<PortfolioContent['results']>;

export default function Results({ results }: { results: Results }) {
  return (
    <section id="results" className="section section--alt" aria-labelledby="results-title">
      <div className="page">
        <div className="section__head">
          <h2 id="results-title" className="section__title">
            {results.heading}
          </h2>
        </div>
        <Reveal stagger>
          <dl className="grid grid--tiles">
            {results.items.map((item, index) => (
              <div key={item.label} className="figure-tile" style={{ '--i': index } as CSSProperties}>
                <dt>
                  <span className="metric">{item.metric}</span>
                  {item.label}
                </dt>
                <dd className="detail">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
