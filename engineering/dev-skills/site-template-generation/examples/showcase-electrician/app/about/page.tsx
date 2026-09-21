import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { getContent } from '@/lib/content';
import PageHeader from '@/components/site/PageHeader';
import Reveal from '@/components/site/Reveal';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const content = getContent();
  return { title: content.about.heading, description: content.company.activity };
}

export default function AboutPage() {
  const content = getContent();
  const { about, company } = content;

  return (
    <>
      <PageHeader title={about.heading} intro={company.activity} />

      <section className="section" aria-labelledby="about-body-title">
        <Reveal className="page about">
          <div className="prose">
            <h2 id="about-body-title" className="visually-hidden">
              {about.heading}
            </h2>
            {about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
          {about.image ? (
            <div className="about__media">
              <Image
                src={about.image.src}
                alt={about.image.alt}
                fill
                sizes="(min-width: 900px) 45vw, 100vw"
              />
            </div>
          ) : null}
        </Reveal>
      </section>

      {about.team && about.team.length > 0 ? (
        <section className="section section--alt" aria-labelledby="team-title">
          <div className="page">
            <div className="section__head">
              <h2 id="team-title" className="section__title">
                {about.teamHeading}
              </h2>
            </div>
            <Reveal stagger>
              <ul className="grid grid--tiles">
                {about.team.map((member, index) => (
                  <li key={member.name} className="team" style={{ '--i': index } as CSSProperties}>
                    {member.portrait ? (
                      <div className="team__portrait">
                        <Image src={member.portrait.src} alt={member.portrait.alt} fill sizes="220px" />
                      </div>
                    ) : null}
                    <p className="team__name">{member.name}</p>
                    <p className="team__role">{member.role}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      ) : null}

      {about.credentials && about.credentials.length > 0 ? (
        <section className="section" aria-labelledby="credentials-title">
          <div className="page">
            <div className="section__head">
              <h2 id="credentials-title" className="section__title">
                {about.credentialsHeading}
              </h2>
            </div>
            <dl className="credentials prose">
              {about.credentials.map((item) => (
                <div key={item.label} className="credentials__item">
                  <dt>{item.label}</dt>
                  <dd>
                    {item.value}
                    {item.issuedBy ? <span className="credentials__issuer">{item.issuedBy}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}
    </>
  );
}
