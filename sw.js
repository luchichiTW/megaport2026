const CACHE = "mp2026-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "./icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const clone = r.clone();
        caches.open(CACHE).then(
          (c) => c.put(e.request, clone),
          (err) => console.warn("Cache put failed:", err)
        );
        return r;
      })
      .catch((err) => {
        console.warn("Fetch failed, serving from cache:", err.message);
        return caches.match(e.request);
      })
  );
});
