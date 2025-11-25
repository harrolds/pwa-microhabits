/// <reference lib="WebWorker" />

export {};

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'pwa-factory-shell-v2';
const OFFLINE_URLS = ['/', '/index.html', '/manifest.webmanifest'];

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    }),
  );
  sw.skipWaiting();
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  sw.clients.claim();
});

sw.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      try {
        const response = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        if (cached) {
          return cached;
        }
        throw error;
      }
    })(),
  );
});

