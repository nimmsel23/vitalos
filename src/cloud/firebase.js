import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { isSupported, getMessaging } from "firebase/messaging";
import { config } from "@firebase-config";

const app = initializeApp(config);

// Firestore with IndexedDB-backed persistent cache.
// Reads served from cache while offline; writes queued locally and
// flushed when connectivity returns. Multi-tab safe.
//
// Note: This enables an offline-first UX for the shell/PWA. Writes made
// while offline are stored in the local IndexedDB queue and will be
// synchronized when connectivity is restored. No additional queue
// management is required here — Firestore handles it internally.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);
// Keep user signed in across reloads — needed for PWA offline UX.
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const googleProvider = new GoogleAuthProvider();

// Messaging ist nicht in jedem Kontext verfügbar (z.B. Safari < 16.4, kein
// installiertes PWA-Icon) — isSupported() vorher prüfen, sonst wirft
// getMessaging() in nicht unterstützten Browsern.
export const getMessagingIfSupported = () => isSupported().then((ok) => (ok ? getMessaging(app) : null));
