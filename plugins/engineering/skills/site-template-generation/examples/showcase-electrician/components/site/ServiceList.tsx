import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Service } from '@/lib/types';
import Reveal from './Reveal';

export default function ServiceList({
  heading,
  intro,
  items,
  detailed = false,
}: {
  heading: string;
  intro?: string;
  items: Service[];
  detailed?: boolean;
}) {
  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="page">
        <div className="section__head">
          <h2 id="services-title" className="section__title">
            {heading}
          </h2>
          {intro ? <p className="section__lead">{intro}</p> : null}
        </div>

        <Reveal stagger>
          <ul className={detailed ? 'services services--detailed' : 'grid grid--cards'}>
            {items.map((service, index) => (
              <li
                key={service.slug}
                id={service.slug}
                className={detailed ? 'service' : 'card'}
                style={{ '--i': index } as CSSProperties}
              >
                {detailed && service.image ? (
                  <div className="service__media">
                    <Image
                      src={service.image.src}
                      alt={service.image.alt}
                      fill
                      sizes="(min-width: 900px) 40vw, 100vw"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div>
                  <h3 className="card__title">{service.title}</h3>
                  <p className="card__body">{service.summary}</p>
                  {detailed ? <p>{service.body}</p> : null}
                  {detailed && service.bullets && service.bullets.length > 0 ? (
                    <ul className="service__bullets">
                      {service.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
