import type { PortfolioContent } from '@/lib/types';

type Props = {
  site: PortfolioContent['site'];
  contact: PortfolioContent['contact'];
  legal: PortfolioContent['legal'];
  ui: PortfolioContent['ui'];
};

export default function SiteFooter({ site, contact, legal, ui }: Props) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <p className="site-footer__name">{site.name}</p>
          <p className="site-footer__contact">
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
            {contact.phone ? <span> {contact.phone}</span> : null}
          </p>
          {contact.social && contact.social.length > 0 ? (
            <ul className="site-footer__social">
              {contact.social.map((entry) => (
                <li key={entry.url}>
                  <a href={entry.url} rel="noopener noreferrer" target="_blank">
                    {entry.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <nav aria-label={ui.footerNavLabel}>
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
