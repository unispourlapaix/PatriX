// PATRI-X Service Worker - Cache et fonctionnement hors ligne
const CACHE_NAME = 'patrix-v1.0.0';
const GAME_ID = 'patrix'; // ID unique pour ce jeu

const urlsToCache = [
    './',
    './index.html',
    './css/main.css',
    './css/game.css',
    './css/animations.css',
    './css/auth.css',
    './css/install.css',
    './js/config.js',
    './js/blocks.js',
    './js/grid.js',
    './js/user-manager.js',
    './js/game-engine.js',
    './js/controls.js',
    './js/effects.js',
    './js/line-tracer.js',
    './js/ui.js',
    './js/main.js',
    './js/audio.js',
    './js/auth-manager.js',
    './js/install-manager.js',
    './assets/images/icon-32.svg',
    './assets/images/icon-192.svg',
    './assets/images/icon-512.svg',
    './assets/sounds/move.mp3',
    './assets/sounds/rotate.mp3',
    './assets/sounds/drop.mp3',
    './assets/sounds/line.mp3',
    './assets/sounds/combo.mp3',
    './assets/sounds/level-up.mp3',
    './assets/sounds/game-over.mp3'
];

// Installation - Mise en cache des ressources
self.addEventListener('install', event => {
    console.log('[Service Worker] Installation de PATRI-X');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Mise en cache des ressources');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activation - Nettoyage des anciens caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activation de PATRI-X');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Supprimer les anciens caches de PATRI-X uniquement
                    if (cacheName.startsWith('patrix-') && cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch - Stratégie Cache First (avec fallback réseau)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retourner la réponse du cache
                if (response) {
                    return response;
                }
                
                // Cloner la requête (elle ne peut être utilisée qu'une fois)
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Vérifier si la réponse est valide
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Cloner la réponse (elle ne peut être utilisée qu'une fois)
                    const responseToCache = response.clone();
                    
                    // Mise en cache dynamique pour les futures requêtes
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Fallback pour la page principale en cas d'échec
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});

// Messages du client (pour forcer la mise à jour)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
