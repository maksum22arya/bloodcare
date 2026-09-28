// BloodCare offline shell — cache-first for the app shell, network-only for /api/.
const CACHE_NAME = "bloodcare-shell-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/css/style.css",
  "/js/app.js",
  "/js/api.js",
  "/js/i18n.js",
  "/js/theme.js",
  "/js/views.js",
  "/js/charts.js",
  "/js/accounts.js",
  "/js/dashboard.js",
  "/js/history.js",
  "/vendor/bootstrap/css/bootstrap.min.css",
  "/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Dynamic data always goes to the network — never cache API responses.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/index.html");
          }
          return Response.error();
        });
    })
  );
});
