const CACHE_NAME = "todo-list-cache-v3";
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

