'use strict';

const versionTag = (() => {
  try {
    const swUrl = new URL(self.location.href);
    return (swUrl.searchParams.get('v') || 'dev').replace(/[^0-9a-zA-Z_-]/g, '');
  } catch {
    return 'dev';
  }
})();
const SHELL_CACHE = `pwa-shell-${versionTag}`;
const MODULE_CACHE = `pwa-modules-${versionTag}`;
const OFFLINE_URL = '/offline.html';
const PRECACHE = ['/', '/index.html', OFFLINE_URL, '/manifest.json'];
const MODULE_ROUTE_HINTS = [/\\/modules\\//, /module-manifest\\.json$/];
const SHELL_ASSET_EXT = /\\.(?:css|js|mjs|cjs|ts|tsx|jsx|json|ico|png|svg|webp|jpg|jpeg|gif|woff2?)$/i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch((error) => {
        console.error('[PWA] Failed to precache shell', error);
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('pwa-shell-') && key !== SHELL_CACHE)
          .map((key) => caches.delete(key)),
      );
      await Promise.all(
        keys
          .filter((key) => key.startsWith('pwa-modules-') && key !== MODULE_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (isModuleRequest(url)) {
    event.respondWith(networkFirst(request, MODULE_CACHE));
    return;
  }

  if (request.mode === 'navigate' || isShellAsset(url)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
  }
});

const isShellAsset = (url) => url.origin === self.location.origin && SHELL_ASSET_EXT.test(url.pathname);

const isModuleRequest = (url) =>
  url.origin === self.location.origin && MODULE_ROUTE_HINTS.some((pattern) => pattern.test(url.pathname));

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    if (request.mode === 'navigate') {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) {
        return offline;
      }
    }
    throw error;
  }
};

const networkFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    const offline = await caches.match(OFFLINE_URL);
    if (offline) {
      return offline;
    }
    throw error;
  }
};


