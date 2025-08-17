importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js');

// Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyCNKVzX7zhjE3apEa76OQ3DszALj263BG4",
  authDomain: "todolistapp-7bf29.firebaseapp.com",
  projectId: "todolistapp-7bf29",
  storageBucket: "todolistapp-7bf29.firebasestorage.app",
  messagingSenderId: "876045465989",
  appId: "1:876045465989:web:a53f4dd30a6867e96f6cec"
});

// VAPID key'i de ekleyelim
const vapidKey = "BGaIqWWI7NWxhc1ZejkIshmals6Cj6hKUEs26XwdTjq8VIOhIceNkn1-OjwCiQeKDuM_7HaZ9Cauf9pRIwBe328";

const messaging = firebase.messaging();

// Push subscription'ı yönet
self.addEventListener('pushsubscriptionchange', event => {
  console.log('Push subscription changed, renewing...');
  event.waitUntil(
    messaging.getToken({ vapidKey: vapidKey })
      .then(newToken => {
        console.log('New token obtained:', newToken);
        // Burada yeni token'ı sunucuya gönderebilirsiniz
      })
      .catch(err => {
        console.log('Error getting new token:', err);
      })
  );
});

// Uygulama kapalıyken gelen bildirimleri göster
messaging.onBackgroundMessage(payload => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Görev Hatırlatıcı';
  const notificationOptions = {
    body: payload.notification?.body || 'Yeni bir görev hatırlatıcısı var!',
    icon: './to-do-list-128.png',
    badge: './to-do-list-128.png',
    tag: 'deadline-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Aç'
      },
      {
        action: 'close',
        title: 'Kapat'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Bildirime tıklandığında uygulamayı aç
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open' || event.action === undefined) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
