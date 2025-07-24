// Service worker pour Mon Budget Malin CI
// Ce fichier permet la mise en cache des ressources de l'application afin
// d'assurer un fonctionnement hors ligne. Lors de l'installation, toutes
// les ressources listées sont ajoutées au cache. Pendant les requêtes
// réseau, le service worker vérifie d'abord le cache avant de procéder
// à un fetch classique.

const CACHE_NAME = 'budget-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './plotly.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Nettoie les anciens caches lors de l'activation du nouveau service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});