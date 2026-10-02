import { getConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

// Served by the service worker when a navigation cannot reach the server. It
// carries no record: the worker never caches one.
export default function OfflinePage() {
  const config = getConfig();
  return (
    <section className="panel panel--narrow" aria-labelledby="offline-title">
      <h1 id="offline-title">{config.ui.offlinePage!.title}</h1>
      <p>{config.ui.offlinePage!.body}</p>
      <p>
        <a className="button" href="/">
          {config.ui.offlinePage!.action}
        </a>
      </p>
    </section>
  );
}
