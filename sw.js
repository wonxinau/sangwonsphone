// Service Worker for Sangwon's Phone PWA
const CACHE_NAME = 'sangwon-phone-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './data/config.json',
  './data/chats.json',
  './assets/wallpaper_lock.jpg',
  './assets/wallpaper_home.jpg',
  './assets/avatar_sangwon.jpg',
  './assets/avatar_anxin.jpg',
  './assets/avatar_noona.jpg',
  './assets/avatar_manager.jpg',
  './assets/avatar_ald1.jpg',
  './assets/photos/photo_1.jpg',
  './assets/photos/photo_2.jpg',
  './assets/photos/photo_3.jpg',
  './assets/photos/photo_4.jpg',
  './assets/photos/photo_5.jpg',
  './assets/photos/photo_6.jpg',
  './assets/photos/photo_7.jpg',
  './assets/photos/photo_8.jpg',
  './assets/photos/photo_9.jpg',
  './assets/photos/photo_10.jpg',
  './assets/photos/photo_11.jpg',
  './assets/photos/photo_12.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network first, fallback to cache
  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (!networkResponse || networkResponse.status !== 200) {
        return networkResponse;
      }
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, responseToCache);
      });
      return networkResponse;
    }).catch(() => {
      return caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || caches.match('./index.html');
      });
    })
  );
});
