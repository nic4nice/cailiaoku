const APP_VERSION = "26.05.19.1";
const CACHE_NAME = "material-supplier-cache-26.05.19.1";
const CORE_ASSETS = [
  "./材料供应查询库_优化版_26.05.19.1.html?v=26.05.19.1",
  "./manifest.json?v=26.05.19.1",
  "./material-supplier-icon-192.png?v=26.05.19.1",
  "./material-supplier-icon-512.png?v=26.05.19.1"
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
        caches.open(CACHE_NAME).then(cache => cache.put("./材料供应查询库_优化版_26.05.19.1.html?v=26.05.19.1", copy));
        return response;
      }).catch(() => caches.match("./材料供应查询库_优化版_26.05.19.1.html?v=26.05.19.1"))
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
