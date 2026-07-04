const CACHE_NAME = 'expense-v19';

self.addEventListener('install', function (e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(['./', './index.html']);
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) { return key !== CACHE_NAME; })
                    .map(function (key) { return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

// NETWORK-FIRST: always try to fetch the latest file from the internet first.
// Only fall back to the saved (cached) copy if there is no internet connection.
// This means new GitHub/Vercel updates load automatically, with no manual
// cache-clearing needed on any device.
self.addEventListener('fetch', function (e) {
    e.respondWith(
        fetch(e.request)
            .then(function (response) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, clone); });
                return response;
            })
            .catch(function () {
                return caches.match(e.request);
            })
    );
});

