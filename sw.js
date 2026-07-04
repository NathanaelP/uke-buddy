// Minimal service worker: caches the app shell for offline use.
// Bump CACHE_NAME on every deploy that changes any cached file — browsers only
// re-install a service worker when its script bytes change, so an unchanged
// version string here means visitors keep getting old cached assets forever,
// even after new files are pushed to the server.
const CACHE_NAME = "uke-buddy-shell-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/app.js",
  "./js/chord-data.js",
  "./js/diagram-renderer.js",
  "./js/progression-store.js",
  "./js/chordpro-parser.js",
  "./js/audio-listener.js",
  "./js/chord-matcher.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
