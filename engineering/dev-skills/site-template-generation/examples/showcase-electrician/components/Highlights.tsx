import type { ShowcaseContent } from '@/lib/types';

type Highlights = NonNullable<ShowcaseContent['home']['highlights']>;

export default function Highlights({ highlights }: { highlights: Highlights }) {
  return (
    <section className="section" aria-labelledby="highlights-title">
      <div className="container">
        <h2 id="highlights-title" className="section__title">
          {highlights.heading}
        </h2>
        <ul className="cards">
          {highlights.items.map((item) => (
            <li key={item.title} className="card">
              <h3 className="card__title">{item.title}</h3>
              <p className="card__body">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
