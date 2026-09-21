import type { LegalPage } from '@/lib/legal';

type Props = { page: LegalPage; pendingNotice: string };

// A marker is rendered in the page, visibly. A legal fact that is missing and
// hidden in a comment is a legal fact nobody ever completes.
export default function LegalDocument({ page, pendingNotice }: Props) {
  return (
    <article className="section legal">
      <div className="container legal__body">
        <h1 className="legal__title">{page.label}</h1>

        {page.markers.length > 0 ? (
          <p className="legal__pending" role="note">
            {pendingNotice}
          </p>
        ) : null}

        {page.sections.map((section) => (
          <section key={section.heading} className="legal__section">
            <h2>{section.heading}</h2>
            {section.intro ? <p>{section.intro}</p> : null}
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {section.lines && section.lines.length > 0 ? (
              <dl className="legal__facts">
                {section.lines.map((line) => (
                  <div key={line.label} className={line.missing ? 'legal__fact legal__fact--missing' : 'legal__fact'}>
                    <dt>{line.label}</dt>
                    <dd>{line.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
