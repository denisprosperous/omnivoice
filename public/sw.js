/* OmniVoice service worker — offline capability (Master Prompt 3.4)
   Cache-first for static assets; network-first for API; offline shell. */
const CACHE = "omnivoice-v1";
const CORE = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Navigations: network-first with offline shell fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put("/", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  // API: network-first, fall back to cache (offline lesson content)
  if (url.pathname.startsWith("/api/")) {
    // Never cache voice endpoints (large, ephemeral)
    if (url.pathname.startsWith("/api/tts") || url.pathname.startsWith("/api/sts") || url.pathname.startsWith("/api/stt") || url.pathname.startsWith("/api/pronunciation")) return;
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static (hashed _next assets + icons): cache-first is safe
  if (url.pathname.startsWith("/_next/static") || url.pathname === "/icon.svg" || url.pathname === "/manifest.json") {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
            return res;
          })
      )
    );
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
