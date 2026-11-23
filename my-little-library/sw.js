/* My Little Library — service worker
   Bump CACHE_VERSION whenever you replace these files with a new version,
   so phones pick up the update. User data lives in IndexedDB and is NOT
   touched by cache updates. */
const CACHE_VERSION = 'mll-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // fonts etc. go to network
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
