import type { ShowcaseContent } from '@/lib/types';
import ThemeToggle from './ThemeToggle';

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
          <ThemeToggle ui={ui} />
        </div>
      </header>
    </>
  );
}
