import type { CSSProperties } from 'react';
import type { ShowcaseContent } from '@/lib/types';
import Reveal from './Reveal';

type Highlights = NonNullable<ShowcaseContent['home']['highlights']>;

export default function Highlights({ highlights }: { highlights: Highlights }) {
  return (
    <section className="section" aria-labelledby="highlights-title">
      <div className="page">
        <div className="section__head">
          <h2 id="highlights-title" className="section__title">
            {highlights.heading}
          </h2>
        </div>
        <Reveal stagger>
          <ul className="grid grid--cards">
            {highlights.items.map((item, index) => (
              <li key={item.title} className="card" style={{ '--i': index } as CSSProperties}>
                <h3 className="card__title">{item.title}</h3>
                <p className="card__body">{item.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
