import type { ShowcaseContent } from '@/lib/types';

type Props = {
  site: ShowcaseContent['site'];
  company: ShowcaseContent['company'];
  contact: ShowcaseContent['contact'];
  legal: ShowcaseContent['legal'];
  ui: ShowcaseContent['ui'];
};

export default function SiteFooter({ site, company, contact, legal, ui }: Props) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <p className="site-footer__name">{site.name}</p>
          <p className="site-footer__contact">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            {contact.phone ? (
              <>
                <br />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </>
            ) : null}
          </p>
          {contact.address ? (
            <address className="site-footer__address">
              {contact.address.street}
              <br />
              {contact.address.postalCode} {contact.address.city}
            </address>
          ) : null}
        </div>

        {contact.hours && contact.hours.length > 0 ? (
          <div>
            <h2 className="site-footer__heading">{ui.hoursHeading}</h2>
            <ul className="site-footer__hours">
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
            <ul className="site-footer__areas">
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
                <a href={`/legal/${page.slug}/`}>{page.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
