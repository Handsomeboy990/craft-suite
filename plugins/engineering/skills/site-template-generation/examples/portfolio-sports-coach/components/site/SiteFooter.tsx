import type { PortfolioContent } from '@/lib/types';

export default function SiteFooter({ content }: { content: PortfolioContent }) {
  const { site, contact, legal, ui } = content;
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
                <a href={`/legal/${page.slug}`}>{page.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
