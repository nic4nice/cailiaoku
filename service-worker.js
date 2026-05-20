const APP_VERSION = "26.05.20.1";
const CACHE_NAME = `material-supplier-cache-${APP_VERSION}`;
const INDEX_URL = `./index.html?v=${APP_VERSION}`;
const CORE_ASSETS = [
  INDEX_URL,
  `./manifest.json?v=${APP_VERSION}`,
  `./material-supplier-icon-192.png?v=${APP_VERSION}`,
  `./material-supplier-icon-512.png?v=${APP_VERSION}`
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS.map(url => new Request(url, { cache: "reload" }))))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.map(name => {
      if (name.startsWith("material-supplier-cache-") && name !== CACHE_NAME) return caches.delete(name);
      return Promise.resolve();
    }))).then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(INDEX_URL, copy));
        return response;
      }).catch(() => caches.match(INDEX_URL))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request, { cache: "no-store" }).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }))
  );
});
