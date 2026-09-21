import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { PortfolioContent } from '@/lib/types';
import Reveal from './Reveal';

type Gallery = NonNullable<PortfolioContent['gallery']>;

export default function Gallery({ gallery, stagger }: { gallery: Gallery; stagger: boolean }) {
  return (
    <section id="gallery" className="section" aria-labelledby="gallery-title">
      <div className="page">
        <div className="section__head">
          <h2 id="gallery-title" className="section__title">
            {gallery.heading}
          </h2>
        </div>
        <Reveal stagger={stagger}>
          <ul className="grid grid--media gallery">
            {gallery.items.map((item, index) => (
              <li key={item.src} className="gallery__item reveal-item" style={{ '--i': index } as CSSProperties}>
                <figure>
                  <div className="gallery__media">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 900px) 25vw, 50vw"
                      loading="lazy"
                    />
                  </div>
                  {item.caption ? <figcaption>{item.caption}</figcaption> : null}
                </figure>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
