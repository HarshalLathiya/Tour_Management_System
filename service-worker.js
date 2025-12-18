/**
 * Tour Support System – Service Worker
 * Offline-first | Static-safe | No backend assumptions
 * Version: 1.0 (FINAL)
 */

const CACHE_NAME = 'tour-support-static-v1';
const OFFLINE_PAGE = './offline.html';

/* ==========================
   STATIC ASSETS TO CACHE
   (LOCAL FILES ONLY)
========================== */
const STATIC_ASSETS = [
    './',
    './index.html',
    './dashboard.html',
    './students.html',
    './attendance.html',
    './itinerary.html',
    './safety.html',
    './documents.html',
    './offline.html',

    './css/style.css',
    './css/mobile.css',

    './js/auth.js',
    './js/data-manager.js',
    './js/main.js'
];

/* ==========================
   INSTALL – PRE-CACHE FILES
========================== */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

/* ==========================
   ACTIVATE – CLEAN OLD CACHES
========================== */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        ).then(() => self.clients.claim())
    );
});

/* ==========================
   FETCH – CACHE FIRST, NETWORK FALLBACK
========================== */
self.addEventListener('fetch', event => {

    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Ignore browser extensions & devtools
    if (
        event.request.url.startsWith('chrome-extension://') ||
        event.request.url.includes('devtools')
    ) return;

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(networkResponse => {
                        // Do NOT cache external CDN responses
                        if (!event.request.url.startsWith(self.location.origin)) {
                            return networkResponse;
                        }

                        const responseClone = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseClone));

                        return networkResponse;
                    })
                    .catch(() => {
                        // If offline & requesting HTML → show offline page
                        if (event.request.headers.get('accept')?.includes('text/html')) {
                            return caches.match(OFFLINE_PAGE);
                        }

                        // Otherwise fail gracefully
                        return new Response(
                            'Offline mode: resource unavailable.',
                            { status: 503, statusText: 'Offline' }
                        );
                    });
            })
    );
});

/* ==========================
   MESSAGE HANDLING
========================== */
self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
