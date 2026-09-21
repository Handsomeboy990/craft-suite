import type { ShowcaseContent } from '@/lib/types';

export default function SiteFooter({ content }: { content: ShowcaseContent }) {
  const { site, company, contact, legal, ui } = content;
  return (
    <footer className="site-footer">
      <div className="page site-footer__inner">
        <div>
          <p className="site-footer__name">{site.name}</p>
          <p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            {contact.phone ? (
              <>
                <br />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </>
            ) : null}
          </p>
          {contact.address ? (
            <address style={{ fontStyle: 'normal' }}>
              {contact.address.street}
              <br />
              {contact.address.postalCode} {contact.address.city}
            </address>
          ) : null}
        </div>

        {contact.hours && contact.hours.length > 0 ? (
          <div>
            <h2 className="site-footer__heading">{ui.hoursHeading}</h2>
            <ul className="site-footer__list">
              {contact.hours.map((slot) => (
                <li key={slot.days}>
                  <span>{slot.days}</span>
                  <span>
                    {slot.opens} {slot.closes}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {company.serviceArea && company.serviceArea.length > 0 ? (
          <div>
            <h2 className="site-footer__heading">{ui.serviceAreaHeading}</h2>
            <ul className="site-footer__list">
              {company.serviceArea.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <nav aria-label={ui.footerNavLabel}>
          <h2 className="site-footer__heading">{ui.footerNavLabel}</h2>
          <ul className="site-footer__legal">
            {legal.pages.map((page) => (
              <li key={page.slug}>
                <a href={`/legal/${page.slug}`}>{page.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
