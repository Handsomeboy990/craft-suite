// The service worker. It serves the shell and the uploaded media from cache,
// falls back to the offline page for a navigation it cannot reach, and never
// caches the back office or an API response: a cached back office is a signed
// in page left on a shared machine.
//
// It is served by a route rather than from public/, because public/ is read
// only from the app's own directory and this file has one source for both
// examples. Each app's `app/sw.js/route.ts` re-exports GET from here, and the
// URL stays /sw.js, so the worker's scope stays the whole origin. The source
// below is the worker exactly as the browser receives it. It sits in a
// template literal, so it must carry no backtick, no dollar brace and no
// backslash.

const SOURCE = `const VERSION = 'v1';
const SHELL = 'shell-' + VERSION;
const MEDIA = 'media-' + VERSION;
const OFFLINE = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(['/', OFFLINE])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => !name.endsWith(VERSION)).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  );
});

function isPrivate(url) {
  return url.pathname.startsWith('/admin') || url.pathname.startsWith('/api');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivate(url)) return;

  // Uploaded media carries a generated name that is never reused, so a long
  // lived cache entry can never be stale.
  if (url.pathname.startsWith('/media/')) {
    event.respondWith(
      caches.open(MEDIA).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(SHELL);
          cache.put(request, response.clone());
          return response;
        } catch {
          const cache = await caches.open(SHELL);
          return (await cache.match(request)) ?? (await cache.match(OFFLINE)) ?? Response.error();
        }
      })(),
    );
  }
});

self.addEventListener('push', (event) => {
  let payload = { title: 'Nouveau message', body: '', url: '/admin/messages' };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    // A push with no readable payload still opens the inbox.
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? '/admin/messages';
  event.waitUntil(self.clients.openWindow(target));
});
`;

export function GET() {
  return new Response(SOURCE, {
    headers: {
      // What Next sent for the file in public/, kept so the browser checks for
      // a new worker on every navigation.
      'Content-Type': 'application/javascript; charset=UTF-8',
      'Cache-Control': 'public, max-age=0',
    },
  });
}
