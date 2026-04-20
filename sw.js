// ControlZ Service Worker
// Cambia este número de versión cada vez que subas una actualización
// para que los usuarios reciban la nueva versión automáticamente.
const VERSION = "v1.0.0";
const CACHE_NAME = "controlz-" + VERSION;

// Archivos que se guardan en caché para funcionar sin internet
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/apple-touch-icon.png",
  "/favicon-32x32.png"
];

// Instalación: guarda los archivos en caché
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activación: elimina cachés viejas (de versiones anteriores)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("controlz-") && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: primero intenta red, si falla usa caché (offline)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red responde, actualiza la caché con la versión nueva
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
