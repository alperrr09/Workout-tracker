// Workout Tracker Service Worker
const CACHE_NAME = ‘workout-tracker-v1’;
const ASSETS = [
‘./workout-calendar.html’,
‘./manifest.json’,
‘./icon-192.png’,
‘./icon-512.png’
];

// Install: cache all assets
self.addEventListener(‘install’, event => {
event.waitUntil(
caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
);
self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener(‘activate’, event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
)
);
self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener(‘fetch’, event => {
if (event.request.method !== ‘GET’) return;

event.respondWith(
caches.match(event.request).then(cached => {
if (cached) return cached;
return fetch(event.request).then(response => {
// Cache Google Fonts too
if (event.request.url.includes(‘fonts.googleapis.com’) ||
event.request.url.includes(‘fonts.gstatic.com’)) {
const clone = response.clone();
caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
}
return response;
}).catch(() => {
// Offline fallback
return caches.match(’./workout-calendar.html’);
});
})
);
});
