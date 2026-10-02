// The shape this document renders. Each instance builds its legal pages in its
// own lib/legal.ts and passes one in; anything else a page carries is ignored.
export type LegalDocumentPage = {
  label: string;
  markers: string[];
  sections: {
    heading: string;
    intro?: string;
    paragraphs?: string[];
    lines?: { label: string; value: string; missing: boolean }[];
  }[];
};

// Markers are rendered in the page, visibly. A legal fact that is missing and
// hidden in a comment is a legal fact nobody ever completes.
export default function LegalDocument({
  page,
  pendingNotice,
}: {
  page: LegalDocumentPage;
  pendingNotice: string;
}) {
  return (
    <article className="section">
      <div className="page prose">
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
              <p
                key={paragraph.slice(0, 40)}
                className={paragraph.startsWith('[ à compléter') ? 'legal__missing' : undefined}
              >
                {paragraph}
              </p>
            ))}
            {section.lines && section.lines.length > 0 ? (
              <dl className="legal__facts">
                {section.lines.map((line) => (
                  <div
                    key={line.label}
                    className={line.missing ? 'legal__fact legal__fact--missing' : 'legal__fact'}
                  >
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
