import { EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { app, googleProvider } from "./firebase.js";
import { needsPasswordReauth } from "./deleteAccountFlow.js";

export async function reauthenticateCurrentUser({ user, password }) {
  if (needsPasswordReauth(user)) {
    const credential = EmailAuthProvider.credential(user.email || "", password || "");
    await reauthenticateWithCredential(user, credential);
    return;
  }
  if (Capacitor.isNativePlatform()) {
    const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
    const idToken = result?.credential?.idToken;
    if (!idToken) {
      const error = new Error("Google-Anmeldung fehlgeschlagen.");
      error.code = "auth/missing-id-token";
      throw error;
    }
    await reauthenticateWithCredential(user, GoogleAuthProvider.credential(idToken));
    return;
  }
  await reauthenticateWithPopup(user, googleProvider);
}

export async function callDeleteOwnAccount(user) {
  if (!user?.getIdToken) {
    const error = new Error("Keine Sitzung.");
    error.code = "unauthenticated";
    throw error;
  }
  await user.getIdToken(true);
  const functions = getFunctions(app, "europe-west1");
  const callable = httpsCallable(functions, "deleteOwnAccount", { timeout: 300000 });
  const response = await callable({});
  if (!response?.data?.ok) {
    const error = new Error("Die Löschung wurde nicht bestätigt.");
    error.code = "unconfirmed";
    throw error;
  }
  return response.data;
}

export async function clearLocalAccountResidue() {
  try { localStorage.clear(); } catch { /* lokale Daten sind nach der Serverlöschung nur noch Rest */ }
  try { sessionStorage.clear(); } catch { /* siehe oben */ }
  if (typeof indexedDB === "undefined" || typeof indexedDB.databases !== "function") return;
  let databases = [];
  try { databases = await indexedDB.databases(); } catch { return; }
  await Promise.all(databases.map((entry) => new Promise((resolve) => {
    if (!entry?.name) { resolve(); return; }
    const request = indexedDB.deleteDatabase(entry.name);
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  })));
}
