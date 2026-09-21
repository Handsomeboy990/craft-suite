import type { PortfolioContent } from '@/lib/types';
import SiteNav from './SiteNav';
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
          <ThemeToggle ui={ui} />
          <SiteNav nav={nav} ui={ui} />
        </div>
      </header>
    </>
  );
}
