const CACHE_NAME = 'fluentgerman-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/css/style.css',
  '/css/landing.css',
  '/js/data/vocabulary.js',
  '/js/data/grammar.js',
  '/js/data/phrases.js',
  '/js/data/alphabet.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).catch(() => caches.match('/app.html'));
    })
  );
});
