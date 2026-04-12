// Service Worker for The Mortgage Geek PWA
// Strategy:
//   - Static assets (icons, images): cache-first for instant loads
//   - HTML/JS/CSS: network-first with cache fallback (keeps content fresh, works offline)
//   - API calls (rates, etc.): bypass cache entirely (always live data)

const CACHE_VERSION = 'mortgagegeek-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: route requests by type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache GET requests from same origin
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // API calls: always network, never cache
  if (url.pathname.startsWith('/api/')) return;

  // Static image assets: cache-first
  if (/\.(png|jpg|jpeg|svg|ico|webp)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        return response;
      }))
    );
    return;
  }

  // HTML/JS/CSS and everything else: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Stash a copy for offline access
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});
