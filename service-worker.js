const CACHE_NAME = "todo-list-cache-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/toDoList.jpg",
  "/manifest.json",
  "/to-do-list 128.png",
  "/to-do-list 512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Önbelleğe alındı");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Alarm bildirimi
self.addEventListener('message', event => {
    if (event.data.type === 'ALARM_REMINDER') {
        const { title, body } = event.data;
        self.registration.showNotification(title, {
            body: body,
            icon: 'icon.png' 
        });
    }
});