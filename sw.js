const CACHE = "mp2026-v5";
const ASSETS = [
  "./index.html",
  "./schedule.js",
  "./artists.js",
  "./app.js",
  "./manifest.json",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./img/megaport_festival_2026_day_1.webp",
  "./img/megaport_festival_2026_day_2.webp",
  "./img/megaport_festival_2026_free_stage.jpg",
  "./img/megaport_festival_2026_map.jpg",
  "./vendor/react.min.js",
  "./vendor/react-dom.min.js",
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
    caches.open(CACHE).then((cache) =>
      cache.match(e.request).then((cached) => {
        const fetched = fetch(e.request)
          .then((r) => {
            if (r.ok) cache.put(e.request, r.clone());
            return r;
          })
          .catch(() => cached);
        return cached || fetched;
      }),
    ),
  );
});
