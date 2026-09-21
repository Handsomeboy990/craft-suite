import type { CSSProperties } from 'react';
import type { PortfolioContent } from '@/lib/types';
import Reveal from './Reveal';

type Testimonials = NonNullable<PortfolioContent['testimonials']>;

export default function Testimonials({ testimonials }: { testimonials: Testimonials }) {
  return (
    <section id="testimonials" className="section section--alt" aria-labelledby="testimonials-title">
      <div className="page">
        <div className="section__head">
          <h2 id="testimonials-title" className="section__title">
            {testimonials.heading}
          </h2>
        </div>
        <Reveal stagger>
          <ul className="grid grid--cards">
            {testimonials.items.map((item, index) => (
              <li key={item.author} className="quote" style={{ '--i': index } as CSSProperties}>
                <figure>
                  <blockquote>
                    <p>{item.quote}</p>
                  </blockquote>
                  <figcaption>
                    <span className="quote__author">{item.author}</span>
                    {item.context ? <span className="quote__context">{item.context}</span> : null}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
