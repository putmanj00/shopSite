// Service Worker for Artisan Collective PWA
const CACHE_NAME = 'artisan-collective-v1';
const OFFLINE_URL = '/offline';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Fetch event - network-first strategy with offline fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip API requests (always fetch fresh)
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();

        // Cache successful responses for static assets
        if (response.ok && shouldCache(event.request.url)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Try to return cached version
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }

          // Return empty response for other requests
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// Helper to determine if a URL should be cached
function shouldCache(url) {
  // Cache static assets
  const cachePatterns = [
    /\/_next\/static\//,
    /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp)$/,
  ];

  return cachePatterns.some((pattern) => pattern.test(url));
}
