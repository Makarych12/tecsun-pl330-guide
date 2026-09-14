/* Service Worker: офлайн-режим для «TECSUN PL-330 — Простая инструкция».
   Стратегия: cache-first для всего app shell. При смене VERSION старый
   кэш удаляется на этапе activate. */

const VERSION = 'v2.0.1';
const CACHE = `pl330-guide-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/topics.js',
  './js/extras.js',
  './js/app.js',
  './assets/radio-photo.webp',
  './assets/radio-photo.jpg',
  './assets/radio-photo-480.webp',
  './assets/radio-photo-480.jpg',
  './assets/icon.svg',
  './assets/favicon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-512-maskable.png',
  './assets/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('pl330-guide-') && k !== CACHE)
            .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Навигация (открытие страницы) — всегда отдаём index.html из кэша,
  // hash-маршруты (#etm) при этом сохраняются браузером.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cached) => cached || fetch(request))
    );
    return;
  }

  // Остальная статика: cache-first, при промахе — сеть + докладываем в кэш.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
