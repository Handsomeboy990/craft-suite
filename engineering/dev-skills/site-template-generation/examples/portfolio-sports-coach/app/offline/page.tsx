import { getContent } from '@/lib/content';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

export const dynamic = 'force-dynamic';

// Served by the service worker when a navigation cannot reach the network.
// Designed like every other page, for the same reason.
export default function OfflinePage() {
  const content = getContent();
  const { offline } = content.ui;

  return (
    <>
      <SiteHeader content={content} />
      <main id="main" className="status-page">
        <div className="page">
          <h1 className="status-page__title">{offline.title}</h1>
          <p className="status-page__body">{offline.body}</p>
          <p>
            <a className="button button--primary" href="/">
              {offline.action}
            </a>
          </p>
        </div>
      </main>
      <SiteFooter content={content} />
    </>
  );
}
