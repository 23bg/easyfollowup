/* Service Worker (manual) - simple caching strategies
   - CACHE_NAME: versioned
   - precache: '/', '/offline'
   - static assets: cache-first
   - api requests: stale-while-revalidate
   - navigation: network-first with offline fallback
*/

const CACHE_NAME = 'easyfollowup-v2';
const PRECACHE_URLS = ['/', '/offline'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isApiRequest(request) {
  try {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/');
  } catch (e) {
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Navigation requests: network-first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match('/offline'))
    );
    return;
  }

  // API requests: network-first with cache fallback
  if (isApiRequest(request)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const networkRes = await fetch(request);
          if (networkRes && networkRes.ok) cache.put(request, networkRes.clone());
          return networkRes;
        } catch (error) {
          const cached = await cache.match(request);
          return cached || new Response(null, { status: 503 });
        }
      })
    );
    return;
  }

  // Static assets: cache-first
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return res;
      }).catch(() => cached))
    );
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        // optionally cache GET responses
        if (request.method === 'GET' && res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'SHOW_LOCAL_NOTIFICATION') {
    const payload = event.data.payload || {};
    const title = payload.title || 'EasyFollowUp';
    const body = payload.body || '';

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        tag: payload.tag,
        renotify: true,
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/icon-192.png',
        data: { url: payload.url || '/' },
        vibrate: payload.vibrate,
        silent: payload.silent,
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const existingClient = windowClients.find((client) => 'focus' in client);
      if (existingClient) {
        existingClient.postMessage({ type: 'NOTIFICATION_CLICK', url });
        return existingClient.focus();
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }

      return undefined;
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag !== 'easyfollowup-sync-queue') return;

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.add('/api/leads');
      } catch (error) {
        // Keep sync best-effort only.
      }
    })
  );
});
