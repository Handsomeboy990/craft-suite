import type { PortfolioContent } from '@/lib/types';

type Results = NonNullable<PortfolioContent['results']>;

export default function Results({ results }: { results: Results }) {
  return (
    <section id="results" className="section section--alt" aria-labelledby="results-title">
      <div className="container">
        <h2 id="results-title" className="section__title">
          {results.heading}
        </h2>
        <dl className="results">
          {results.items.map((item) => (
            <div key={item.label} className="results__item reveal">
              <dt className="results__label">{item.label}</dt>
              <dd className="results__metric">{item.metric}</dd>
              <dd className="results__detail">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
