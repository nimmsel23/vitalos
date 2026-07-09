// Eigener SW nur für FCM — bewusst getrennt vom VitePWA-generierten sw.js
// (generateSW-Modus erlaubt keinen eigenen Code). Wird auf einem eigenen
// Scope ('/firebase-push/') registriert, siehe src/hooks/usePushNotifications.js.
// Push-Events landen trotzdem hier, weil sie an die PushSubscription hängen,
// nicht am URL-Scope — Scope-Trennung dient nur dazu, den Haupt-SW nicht zu stören.
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

// Firebase Web-Config ist per Design öffentlich (kein Secret, siehe
// firebase.config.js im Repo-Root) — hier dupliziert, weil ein SW aus
// public/ kein ES-Modul ist und @firebase-config nicht importieren kann.
firebase.initializeApp({
  apiKey:            "AIzaSyD1hvp2UYrvizLOzoSqOX-bwRWcCpJVAlg",
  authDomain:        "fitness-aos.firebaseapp.com",
  projectId:         "fitness-aos",
  storageBucket:     "fitness-aos.firebasestorage.app",
  messagingSenderId: "842575255284",
  appId:             "1:842575255284:web:65c4831683a893c110f0a1",
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  const tab = payload.data?.tab || '';
  self.registration.showNotification(title || 'VitalOS', {
    body: body || '',
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    data: { tab },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const tab = event.notification.data?.tab || ''
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const url = tab ? `/#${tab}` : '/'
      for (const client of clients) {
        if ('focus' in client) { client.navigate?.(url); return client.focus() }
      }
      return self.clients.openWindow(url)
    })
  );
});
