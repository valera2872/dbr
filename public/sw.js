const CACHE_NAME = 'dbr-v0-9-4-stage-aware-header';
const APP_SHELL = [
  '/dbr/',
  '/dbr/manifest.webmanifest',
  '/dbr/icon.svg',
  '/dbr/media/case-001/scenes/room-314.svg',
  '/dbr/media/case-001/scenes/corridor-3f.svg',
  '/dbr/media/case-001/portraits/kirill.svg',
  '/dbr/media/case-001/portraits/marina.svg',
  '/dbr/media/case-001/portraits/denis.svg',
  '/dbr/media/case-001/portraits/vera.svg',
  '/dbr/media/case-001/portraits/ilya.svg',
  '/dbr/media/case-001/portraits/elena.svg',
  '/dbr/media/case-001/evidence/e006-archive-plan.svg',
  '/dbr/media/case-001/evidence/e008-archive-table.svg',
  '/dbr/media/case-001/evidence/e010-service-room.svg',
  '/dbr/media/case-001/evidence/e011-card-lab.svg',
  '/dbr/media/case-001/evidence/final-case-report.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/dbr/')))
  );
});
