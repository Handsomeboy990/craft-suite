import type { ShowcaseContent } from '@/lib/types';

type Proof = NonNullable<ShowcaseContent['home']['proof']>;

export default function Proof({ proof }: { proof: Proof }) {
  return (
    <section className="section section--alt" aria-labelledby="proof-title">
      <div className="container">
        <h2 id="proof-title" className="section__title">
          {proof.heading}
        </h2>
        <dl className="proof">
          {proof.items.map((item) => (
            <div key={item.label} className="proof__item">
              <dt className="proof__label">{item.label}</dt>
              <dd className="proof__value">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
