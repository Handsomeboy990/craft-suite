import type { Metadata } from 'next';
import Image from 'next/image';
import { content } from '@/lib/content';
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: content.about.heading,
  description: content.company.activity,
};

export default function AboutPage() {
  const { about, company } = content;

  return (
    <>
      <PageHeader title={about.heading} intro={company.activity} />

      <section className="section" aria-labelledby="about-body-title">
        <div className="container about__grid">
          <div className="about__text">
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
                sizes="(min-width: 960px) 45vw, 100vw"
              />
            </div>
          ) : null}
        </div>
      </section>

      {about.team && about.team.length > 0 ? (
        <section className="section section--alt" aria-labelledby="team-title">
          <div className="container">
            <h2 id="team-title" className="section__title">
              {about.teamHeading}
            </h2>
            <ul className="team">
              {about.team.map((member) => (
                <li key={member.name} className="team__member">
                  {member.portrait ? (
                    <div className="team__portrait">
                      <Image
                        src={member.portrait.src}
                        alt={member.portrait.alt}
                        fill
                        sizes="200px"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <p className="team__name">{member.name}</p>
                  <p className="team__role">{member.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {about.credentials && about.credentials.length > 0 ? (
        <section className="section" aria-labelledby="credentials-title">
          <div className="container">
            <h2 id="credentials-title" className="section__title">
              {about.credentialsHeading}
            </h2>
            <dl className="credentials">
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
