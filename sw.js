/* FODMAP+ — service worker : cache l'app shell pour un fonctionnement hors-ligne (Android + web). */
const CACHE_NAME = 'fodmap-plus-v25';
// Cache séparé pour les polices : elles ne changent jamais, autant qu'elles survivent
// aux montées de version de l'app shell (l'activate ci-dessous l'épargne explicitement).
const FONT_CACHE = 'fodmap-plus-fonts-v1';
const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== FONT_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stratégie : réseau d'abord pour la page HTML (l'app se met à jour dès qu'un nouveau
// déploiement est en ligne), avec repli sur le cache hors-ligne. Cache d'abord pour les
// autres assets (icônes, manifest) qui changent rarement.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Polices Google (Playfair Display + Inter) : cache d'abord, dans leur propre cache.
  // Sans ça l'app retombe sur les polices système hors ligne — visible depuis que le
  // serif display porte l'identité. La feuille CSS est demandée en no-cors par le <link>,
  // donc sa réponse est opaque (status 0) : on l'accepte explicitement, sinon rien ne
  // serait mis en cache. Les .woff2, eux, passent en CORS et ont un vrai status.
  if (FONT_ORIGINS.includes(url.origin)) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request)
            .then((response) => {
              if (response && (response.ok || response.type === 'opaque')) {
                cache.put(event.request, response.clone());
              }
              return response;
            })
            .catch(() => cached);
        })
      )
    );
    return;
  }

  // Requêtes vers une autre origine (Open Food Facts) : on laisse passer sans y toucher.
  // Sans ça, le repli hors-ligne renverrait la page HTML à un appel d'API, qui échouerait
  // sur un parse JSON incompréhensible au lieu d'afficher « pas de connexion ».
  if (url.origin !== self.location.origin) return;

  const isHTML = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
