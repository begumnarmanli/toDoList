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

// Alarm bildirimi
self.addEventListener('message', event => {
    if (event.data.type === 'ALARM_REMINDER') {
        const { title, body } = event.data;
        self.registration.showNotification(title, {
            body: body,
            icon: './to-do-list-128.png'
        });
    }
    
    // Zamanlanmış bildirim
    if (event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, body, delay, customer, project } = event.data.data;
        
        // Belirtilen süre sonra bildirim göster
        setTimeout(() => {
            self.registration.showNotification(title, {
                body: body,
                icon: './to-do-list-128.png',
                badge: './to-do-list-128.png',
                tag: `deadline-${customer}`,
                requireInteraction: true,
                data: {
                    customer: customer,
                    project: project
                }
            });
        }, delay);
    }
});

// Bildirime tıklandığında uygulamayı aç
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});