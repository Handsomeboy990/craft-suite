import type { ShowcaseContent } from '@/lib/types';

type Props = {
  site: ShowcaseContent['site'];
  pages: ShowcaseContent['pages'];
  ui: ShowcaseContent['ui'];
  contact: ShowcaseContent['contact'];
};

export default function SiteHeader({ site, pages, ui, contact }: Props) {
  return (
    <>
      <a className="skip-link" href="#main">
        {ui.skipToContent}
      </a>
      <header className="site-header">
        <div className="container site-header__inner">
          <a className="site-header__brand" href="/">
            <span className="site-header__name">{site.name}</span>
            {site.tagline ? <span className="site-header__tagline">{site.tagline}</span> : null}
          </a>
          <nav aria-label={ui.primaryNavLabel}>
            <ul className="site-header__nav">
              {pages
                .filter((page) => page.inNav)
                .map((page) => (
                  <li key={page.href}>
                    <a href={page.href}>{page.label}</a>
                  </li>
                ))}
            </ul>
          </nav>
          {contact.phone ? (
            <a className="site-header__phone" href={`tel:${contact.phone.replace(/\s/g, '')}`}>
              {contact.phone}
            </a>
          ) : null}
        </div>
      </header>
    </>
  );
}
