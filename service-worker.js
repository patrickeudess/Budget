// Service Worker pour Mon Budget Malin
const CACHE_NAME = 'mon-budget-malin-v1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/transactions.html',
    '/budgets.html',
    '/app.js',
    '/styles.css',
    '/plotly.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache ouvert');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Erreur lors de l\'installation du cache:', error);
    })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
        caches.keys().then((cacheNames) => {
      return Promise.all(
                cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
                        console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorer les requêtes vers des domaines externes
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

  event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retourner la réponse du cache si elle existe
                if (response) {
                    return response;
                }

                // Sinon, faire la requête réseau
                return fetch(event.request)
                    .then((response) => {
                        // Vérifier si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cloner la réponse pour la mettre en cache
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // En cas d'erreur réseau, retourner une page d'erreur personnalisée
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
    })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Gestion des notifications push (optionnel)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Nouvelle notification de Mon Budget Malin',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Voir les détails',
                icon: '/icon-192.png'
            },
            {
                action: 'close',
                title: 'Fermer',
                icon: '/icon-192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Mon Budget Malin', options)
    );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/index.html')
        );
    } else if (event.action === 'close') {
        // Fermer la notification
        event.notification.close();
    } else {
        // Action par défaut
        event.waitUntil(
            clients.openWindow('/index.html')
        );
    }
});

// Gestion des erreurs
self.addEventListener('error', (event) => {
    console.error('Erreur du service worker:', event.error);
});

// Gestion des rejets de promesses non gérés
self.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason);
});

// Fonction pour mettre à jour le cache
function updateCache() {
    return caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(urlsToCache);
        });
}

// Fonction pour nettoyer les anciens caches
function cleanOldCaches() {
    return caches.keys()
        .then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
}

// Fonction pour vérifier la connectivité
function checkConnectivity() {
    return fetch('/index.html', { method: 'HEAD' })
        .then(() => true)
        .catch(() => false);
}

// Fonction pour synchroniser les données (si nécessaire)
function syncData() {
    // Ici, vous pourriez synchroniser les données avec un serveur
    console.log('Synchronisation des données...');
}

// Écouter les changements de connectivité
self.addEventListener('online', () => {
    console.log('Connexion rétablie');
    syncData();
});

self.addEventListener('offline', () => {
    console.log('Connexion perdue');
});

// Fonction pour envoyer une notification
function sendNotification(title, options) {
    return self.registration.showNotification(title, options);
}

// Fonction pour obtenir les données du cache
function getCachedData(url) {
    return caches.match(url)
        .then((response) => {
            if (response) {
                return response.json();
            }
            return null;
        });
}

// Fonction pour mettre en cache des données
function cacheData(url, data) {
    const response = new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.put(url, response);
        });
}