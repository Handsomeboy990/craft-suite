import Image from 'next/image';
import type { PortfolioContent } from '@/lib/types';

export default function About({ about }: { about: PortfolioContent['about'] }) {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        {about.portrait ? (
          <div className="about__portrait">
            <Image
              src={about.portrait.src}
              alt={about.portrait.alt}
              fill
              sizes="(min-width: 900px) 40vw, 100vw"
            />
          </div>
        ) : null}
        <div className="about__text reveal">
          <h2 id="about-title" className="section__title">
            {about.heading}
          </h2>
          {about.body.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
          {about.facts && about.facts.length > 0 ? (
            <dl className="about__facts">
              {about.facts.map((item) => (
                <div key={item.label} className="about__fact">
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}
