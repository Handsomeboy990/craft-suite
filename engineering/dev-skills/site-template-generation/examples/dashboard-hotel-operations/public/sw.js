// The service worker of the dashboard. It keeps the offline page and the
// static assets of the shell, and nothing else. A page or an API answer
// carries records, and a record is never written to a cache: a signed out
// browser, or anyone at a shared desk, must not be able to read one back with
// the network cut. A navigation that cannot reach the server gets the offline
// page.

const VERSION = 'v1';
const SHELL = `shell-${VERSION}`;
const OFFLINE = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.add(new Request(OFFLINE, { credentials: 'omit' })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== SHELL).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Hashed build assets never change under the same name: cache first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(SHELL).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Pages: always the network. On failure, the offline page, never a cached
  // copy of a page that held records.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(SHELL);
        return (await cache.match(OFFLINE)) ?? Response.error();
      }),
    );
  }
  // Everything else, the API included, goes to the network untouched.
});
