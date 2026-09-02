// Minimal service worker: caches the app shell so openCal opens instantly
// and doesn't hard-fail offline. Deliberately no runtime asset caching
// strategy beyond this — the app is data-driven (auth + Postgres), so a full
// offline mode is out of scope for the MVP.

const CACHE_NAME = "opencal-shell-v1";
const SHELL_ASSETS = ["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.url.includes("/api/")) {
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).catch(() => cached)),
  );
});
