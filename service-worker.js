const CACHE_NAME = "todo-list-cache-v2";
const urlsToCache = [
  "/toDoList/",
  "/toDoList/index.html",
  "/toDoList/style.css",
  "/toDoList/script.js",
  "/toDoList/toDoList.jpg",
  "/toDoList/manifest.json",
  "/toDoList/to-do-list 128.png",
  "/toDoList/to-do-list 512.png",
  "/toDoList/icon.png"
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