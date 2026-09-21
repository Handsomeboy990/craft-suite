import type { PortfolioContent } from '@/lib/types';
import ThemeToggle from './ThemeToggle';

export default function SiteHeader({ content }: { content: PortfolioContent }) {
  const { site, nav, ui } = content;
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
              {nav.map((entry) => (
                <li key={entry.href}>
                  <a href={entry.href}>{entry.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle ui={ui} />
        </div>
      </header>
    </>
  );
}
