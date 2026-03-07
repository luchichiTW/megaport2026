const CACHE = "mp2026-v3";
const ASSETS = [
  "./index.html",
  "./schedule.js",
  "./artists.js",
  "./manifest.json",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  globalThis.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  );
  globalThis.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const clone = r.clone();
        caches.open(CACHE).then(
          (c) => c.put(e.request, clone),
          (err) => console.warn("Cache put failed:", err),
        );
        return r;
      })
      .catch((err) => {
        console.warn("Fetch failed, serving from cache:", err.message);
        return caches.match(e.request);
      }),
  );
});
