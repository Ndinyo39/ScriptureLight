// ── ScriptureLight Service Worker ──────────────────────────────────────
// Bump CACHE_VERSION whenever you deploy new CSS/JS to push
// updates to installed PWA users on their next visit.
const CACHE_VERSION = 'v3';
const CACHE_NAME = `scripturelight-${CACHE_VERSION}`;

// Static shell assets to always pre-cache
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Logo.png'
];

// ── INSTALL: pre-cache shell ────────────────────────────────────────────
self.addEventListener('install', event => {
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

// ── ACTIVATE: purge old caches, claim all clients ───────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Delete any old versioned caches
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key.startsWith('scripturelight-') && key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      ),
      // Take control of all open tabs immediately
      clients.claim()
    ])
  );
});

// ── FETCH: network-first for navigation/CSS/JS; cache-first for images ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // For HTML navigations and CSS/JS assets: network-first
  if (
    request.mode === 'navigate' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache a copy of fresh responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
    );
    return;
  }

  // For images, fonts, and other static assets: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      });
    })
  );
});
