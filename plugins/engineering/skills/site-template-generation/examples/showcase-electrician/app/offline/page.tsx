import { getContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

// Served by the service worker when a navigation cannot reach the network.
export default function OfflinePage() {
  const { offline } = getContent().ui;
  return (
    <div className="status-page">
      <div className="page">
        <h1 className="status-page__title">{offline.title}</h1>
        <p className="status-page__body">{offline.body}</p>
        <p>
          <a className="button button--primary" href="/">
            {offline.action}
          </a>
        </p>
      </div>
    </div>
  );
}
