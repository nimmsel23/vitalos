import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { isSupported, getMessaging } from "firebase/messaging";
import { getAI, VertexAIBackend } from "firebase/ai";
import { config } from "@firebase-config";
import { isProductBuild } from "./productRuntime.js";

// Guard gegen Doppel-Init: im Local-Build können Sub-Repo-firebase.js-Module
// (journal/habits) vor diesem Modul evaluieren — dann existiert die App schon
// und initializeFirestore() mit eigenen Optionen würde werfen (Tab-Hänger).
const alreadyInit = getApps().length > 0;
export const app = alreadyInit ? getApp() : initializeApp(config);

// Firestore with IndexedDB-backed persistent cache.
// Reads served from cache while offline; writes queued locally and
// flushed when connectivity returns. Multi-tab safe.
//
// Note: This enables an offline-first UX for the shell/PWA. Writes made
// while offline are stored in the local IndexedDB queue and will be
// synchronized when connectivity is restored. No additional queue
// management is required here — Firestore handles it internally.
export const db = alreadyInit
  ? getFirestore(app)
  : initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });

export const isNativeShell = Capacitor.isNativePlatform();
function initializeShellAuth() {
  if (!isNativeShell) return getAuth(app);
  try {
    // Capacitor's local WebView uses IndexedDB to persist the JS SDK session.
    return initializeAuth(app, { persistence: indexedDBLocalPersistence });
  } catch {
    // A module may have initialized Auth before the shell entry was evaluated.
    return getAuth(app);
  }
}
export const auth = initializeShellAuth();
// Keep browser users signed in across reloads — needed for PWA offline UX.
if (!isNativeShell) setPersistence(auth, browserLocalPersistence).catch(() => {});

export const googleProvider = new GoogleAuthProvider();

// Vertex AI — fuel-dev (ScannerModal, LogView, MicrosAiCoach) erwartet diesen
// Export, da deren firebase.js im Firebase-Build hierauf umgeleitet wird.
// Product AI must use a server-enforced entitlement and quota. Legacy Fuel
// client-side AI is unavailable until it has a server-backed product adapter.
export const vertexAI = isProductBuild() ? null : getAI(app, { backend: new VertexAIBackend("us-central1") });
// fitness-apps Firebase-Layer importiert im Shell-Build weiterhin getVertexAI
// aus ../firebase.js. Die Shell stellt deshalb denselben Entry-Point bereit.
export function getVertexAI() {
  return vertexAI;
}

// Messaging ist nicht in jedem Kontext verfügbar (z.B. Safari < 16.4, kein
// installiertes PWA-Icon) — isSupported() vorher prüfen, sonst wirft
// getMessaging() in nicht unterstützten Browsern.
// Fuel imports the instance as a live binding; shell callers await the getter.
export let messaging = null;
export async function getMessagingIfSupported() {
  if (messaging) return messaging;
  if (!(await isSupported())) return null;
  messaging = getMessaging(app);
  return messaging;
}
// Prepare Fuel's compatible export without throwing during app startup on
// unsupported/private browsers. Explicit callers can still surface failures.
getMessagingIfSupported().catch(() => {});
