const CACHE_NAME = 'fit-fokus-cache-v2';
const API_CACHE = 'fit-fokus-api-v1';
const ASSETS = [
  '/',
  '/favicon.svg',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) =>
            key === CACHE_NAME || key === API_CACHE ? undefined : caches.delete(key)
          )
        )
      )
      .then(() => self.clients.claim())
  );
});

// Basic network-first for navigations, cache-first for static, ignore API.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return; // only cache GET
  const isApi = url.pathname.startsWith('/api/');
  const canCacheApi = (path) => {
    // Only cache safe, idempotent GET endpoints
    return (
      path === '/api/exercises' ||
      path === '/api/workouts' ||
      path.startsWith('/api/workouts/') ||
      path === '/api/progress'
    );
  };

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match('/')))
    );
    return;
  }

  if (isApi) {
    if (!canCacheApi(url.pathname)) return; // passthrough for non-cached APIs
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            const ct = response.headers.get('content-type') || '';
            if (response.ok && ct.includes('application/json')) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => undefined);
        return cached || network || new Response(JSON.stringify({ error: 'offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  // Static assets: cache-first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});

// Allow immediate activation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
