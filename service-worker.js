/**
 * Tour Support System - Service Worker
 * Enables offline functionality and caching
 */

const CACHE_NAME = 'tour-support-v1.2';
const OFFLINE_URL = 'offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './dashboard.html',
    './students.html',
    './attendance.html',
    './itinerary.html',
    './safety.html',
    './documents.html',
    './css/style.css',
    './css/mobile.css',
    './js/auth.js',
    './js/data-manager.js',
    './js/attendance.js',
    './js/main.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching app assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // Check if valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the new response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If network fails and request is for HTML, show offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }

                        // For other requests, return a generic offline response
                        return new Response('You are offline. Please check your internet connection.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Sync event - handle background sync
self.addEventListener('sync', event => {
    if (event.tag === 'sync-attendance') {
        event.waitUntil(syncAttendance());
    }
});

// Sync attendance data
async function syncAttendance() {
    // This would sync with Google Sheets if implemented
    console.log('Background sync: Attendance data');

    // Get pending changes from IndexedDB or localStorage
    const pendingChanges = await getPendingChanges();

    if (pendingChanges.length > 0) {
        // Attempt to sync each change
        for (const change of pendingChanges) {
            try {
                await syncChange(change);
                await markChangeAsSynced(change.id);
            } catch (error) {
                console.error('Failed to sync change:', change.id, error);
            }
        }
    }
}

// Get pending changes (stub implementation)
async function getPendingChanges() {
    // In a real implementation, this would get changes from IndexedDB
    return [];
}

// Sync a single change (stub implementation)
async function syncChange(change) {
    // This would send data to Google Sheets
    console.log('Syncing change:', change);
    return Promise.resolve();
}

// Mark change as synced (stub implementation)
async function markChangeAsSynced(changeId) {
    // Remove from pending changes
    console.log('Marked as synced:', changeId);
}

// Push notification handling
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Tour update notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'View'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Tour Support System', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/dashboard.html')
        );
    }
});

// Periodic sync for background updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-attendance-stats') {
        event.waitUntil(updateAttendanceStats());
    }
});

// Update attendance stats in background
async function updateAttendanceStats() {
    // Update cached stats
    console.log('Periodic sync: Updating attendance stats');

    // In a real implementation, this would fetch latest stats
    // and update the cache
}

// Message handling from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_DATA') {
        // Cache specific data
        cacheData(event.data.url, event.data.data);
    }
});

// Cache data from main thread
async function cacheData(url, data) {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(url, response);
}