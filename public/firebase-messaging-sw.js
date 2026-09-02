importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAiOYULHgil5ZHuczFYFxRIdYrIu5cbQCU",
  authDomain: "svt-cashew.firebaseapp.com",
  projectId: "svt-cashew",
  storageBucket: "svt-cashew.firebasestorage.app",
  messagingSenderId: "249310296378",
  appId: "1:249310296378:web:84e4bdd6df6d63cc353803",
  measurementId: "G-XY8ZSZ8RHC"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || '🔔 NEW ORDER RECEIVED!';
  const notificationOptions = {
    body: payload.notification?.body || 'A new cashew order was placed on Sidhi Vinayaka Traders.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
