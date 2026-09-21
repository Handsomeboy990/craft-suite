import type { CSSProperties } from 'react';
import type { ShowcaseContent } from '@/lib/types';
import Reveal from './Reveal';

type Proof = NonNullable<ShowcaseContent['home']['proof']>;

export default function Proof({ proof }: { proof: Proof }) {
  return (
    <section className="section section--alt" aria-labelledby="proof-title">
      <div className="page">
        <div className="section__head">
          <h2 id="proof-title" className="section__title">
            {proof.heading}
          </h2>
        </div>
        <Reveal stagger>
          <dl className="grid grid--tiles">
            {proof.items.map((item, index) => (
              <div key={item.label} className="figure-tile" style={{ '--i': index } as CSSProperties}>
                <dt>
                  <span className="metric">{item.value}</span>
                  {item.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
