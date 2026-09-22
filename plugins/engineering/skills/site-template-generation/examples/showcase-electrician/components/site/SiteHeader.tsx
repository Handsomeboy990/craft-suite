import type { ShowcaseContent } from '@/lib/types';
import SiteNav from './SiteNav';

export default function SiteHeader({ content }: { content: ShowcaseContent }) {
  const { site, pages, ui, contact } = content;
  return (
    <>
      <a className="skip-link" href="#main">
        {ui.skipToContent}
      </a>
      <header className="site-header">
        <div className="page site-header__inner">
          <a className="site-header__brand" href="/">
            <span className="site-header__name">{site.name}</span>
            {site.tagline ? <span className="site-header__tagline">{site.tagline}</span> : null}
          </a>
          {/* On a trade site the telephone outranks everything else in the
              header, so it stays visible at every width rather than hiding
              inside the menu. */}
          {contact.phone ? (
            <a className="site-header__phone" href={`tel:${contact.phone.replace(/\s/g, '')}`}>
              {contact.phone}
            </a>
          ) : null}
          <SiteNav pages={pages} ui={ui} />
        </div>
      </header>
    </>
  );
}
