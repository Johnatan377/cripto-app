import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

const CACHE_VERSION = 'v2';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force waiting service worker to become active
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Careful not to delete Workbox's own caches if they don't match our versioning scheme
                    // But user explicitly requested this logic:
                    if (cacheName !== CACHE_VERSION && !cacheName.startsWith('workbox-precache')) {
                        console.log('[SW] Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(self.clients.claim()); // Take control of all clients immediately
});

self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
