import type { PortfolioContent } from '@/lib/types';

type Testimonials = NonNullable<PortfolioContent['testimonials']>;

export default function Testimonials({ testimonials }: { testimonials: Testimonials }) {
  return (
    <section id="testimonials" className="section section--alt" aria-labelledby="testimonials-title">
      <div className="container">
        <h2 id="testimonials-title" className="section__title">
          {testimonials.heading}
        </h2>
        <ul className="quotes">
          {testimonials.items.map((item) => (
            <li key={item.author} className="quote reveal">
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
      </div>
    </section>
  );
}
