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

// PWA için optimize edilmiş bildirim sistemi - Firebase olmadan
self.addEventListener('message', event => {
    console.log('PWA Service Worker mesajı alındı:', event.data);
    
    if (event.data.type === 'ALARM_REMINDER') {
        const { title, body } = event.data;
        showPWANotification(title, body);
    }
    
    // Zamanlanmış bildirim - PWA için optimize
    if (event.data.type === 'SCHEDULE_NOTIFICATION') {
        const { title, body, delay, customer, project } = event.data.data;
        
        console.log('PWA için bildirim zamanlandı:', { title, body, delay });
        
        // Belirtilen süre sonra bildirim göster
        setTimeout(() => {
            showPWANotification(title, body, customer, project);
        }, delay);
    }
    
    // Test bildirimi
    if (event.data.type === 'TEST_NOTIFICATION') {
        showPWANotification('Test Bildirimi', 'PWA bildirim sistemi çalışıyor!');
    }
    
    // Anında bildirim testi
    if (event.data.type === 'IMMEDIATE_NOTIFICATION') {
        showPWANotification('Anında Test', 'Service Worker çalışıyor!');
    }
});

// Android için ek event listener'lar
self.addEventListener('install', event => {
    console.log('Service Worker yüklendi');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('Service Worker aktif');
    event.waitUntil(self.clients.claim());
});

// PWA için özel bildirim fonksiyonu
function showPWANotification(title, body, customer = '', project = '') {
    const notificationOptions = {
        body: body,
        icon: './to-do-list-128.png',
        badge: './to-do-list-128.png',
        tag: `deadline-${customer}`,
        requireInteraction: true,
        // PWA'da daha iyi çalışan ayarlar
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
        actions: [
            {
                action: 'open',
                title: 'Aç'
            },
            {
                action: 'close',
                title: 'Kapat'
            }
        ],
        // PWA'da ek ayarlar
        data: {
            url: self.location.origin,
            customer: customer,
            project: project
        }
    };

    // PWA'da bildirim göster
    self.registration.showNotification(title, notificationOptions)
        .then(() => {
            console.log('✅ PWA bildirimi gösterildi:', title);
        })
        .catch(error => {
            console.log('❌ PWA bildirim hatası:', error);
        });
}

// PWA'da bildirim tıklama olayı
self.addEventListener('notificationclick', event => {
    console.log('PWA bildirimi tıklandı:', event);
    
    event.notification.close();
    
    // PWA'yı aç
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Eğer PWA zaten açıksa, onu odakla
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // PWA açık değilse, yeni pencerede aç
            if (clients.openWindow) {
                return clients.openWindow(self.location.origin);
            }
        })
    );
});

// PWA'da push event'ini yakala
self.addEventListener('push', event => {
    console.log('PWA push event alındı:', event);
    
    if (event.data) {
        try {
            const data = event.data.json();
            showPWANotification(data.title || 'Görev Hatırlatıcı', data.body || 'Yeni bildirim');
        } catch (e) {
            showPWANotification('Görev Hatırlatıcı', 'Yeni bir görev hatırlatıcısı var!');
        }
    } else {
        showPWANotification('Görev Hatırlatıcı', 'Yeni bir görev hatırlatıcısı var!');
    }
});