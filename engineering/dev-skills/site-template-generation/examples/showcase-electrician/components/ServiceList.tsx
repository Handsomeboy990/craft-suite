import Image from 'next/image';
import type { Service } from '@/lib/types';

type Props = { heading: string; intro?: string; items: Service[]; detailed?: boolean };

export default function ServiceList({ heading, intro, items, detailed = false }: Props) {
  return (
    <section className="section" aria-labelledby="services-title">
      <div className="container">
        <h2 id="services-title" className="section__title">
          {heading}
        </h2>
        {intro ? <p className="section__intro">{intro}</p> : null}

        <ul className={detailed ? 'services services--detailed' : 'services'}>
          {items.map((service) => (
            <li key={service.slug} id={service.slug} className="service">
              {service.image ? (
                <div className="service__media">
                  <Image
                    src={service.image.src}
                    alt={service.image.alt}
                    fill
                    sizes="(min-width: 960px) 45vw, 100vw"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="service__body">
                <h3 className="service__title">{service.title}</h3>
                <p className="service__summary">{service.summary}</p>
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
      </div>
    </section>
  );
}
