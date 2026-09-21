import Image from 'next/image';
import type { PortfolioContent } from '@/lib/types';

type Gallery = NonNullable<PortfolioContent['gallery']>;

export default function Gallery({ gallery }: { gallery: Gallery }) {
  return (
    <section id="gallery" className="section" aria-labelledby="gallery-title">
      <div className="container">
        <h2 id="gallery-title" className="section__title">
          {gallery.heading}
        </h2>
        <ul className="gallery">
          {gallery.items.map((item) => (
            <li key={item.src} className="gallery__item reveal">
              <figure>
                <div className="gallery__media">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 900px) 30vw, 50vw"
                    loading="lazy"
                  />
                </div>
                {item.caption ? <figcaption>{item.caption}</figcaption> : null}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
