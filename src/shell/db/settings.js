/**
 * User-Profil — users/{uid} (Stammdaten, separat von fitness/{uid}/settings).
 *
 * Shell-eigen: das Profil gehört der vitalos-Shell (Coach sieht alle
 * Klienten via getAllUserProfiles aus dem fitness-Layer), nicht einem
 * einzelnen Tempel.
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../cloud/firebase.js";

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), {
      ...data,
      updated_at: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (e) {
    console.error("updateUserProfile failed:", e);
    return false;
  }
}
/**
 * Push-Notification-Settings — fitness/{uid}/settings/push.
 *
 * Shell-eigen: Web-Push (VAPID/Messaging) ist ein Shell-Feature
 * (usePushNotifications.js), kein Sub-Repo-Feature.
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../cloud/firebase.js";
import { getUid } from "./fitness.js";

const DEFAULT_PUSH_SETTINGS = {
  enabled: false,
  token: null,
  reminderTime: "18:00",
  types: { workout: true, habit: true, coverage: true, restday: true },
};

export async function getPushSettings() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "push"));
  if (!snap.exists()) return DEFAULT_PUSH_SETTINGS;
  return { ...DEFAULT_PUSH_SETTINGS, ...snap.data() };
}

export async function savePushSettings(settings) {
  await setDoc(doc(db, "fitness", getUid(), "settings", "push"), {
    ...settings,
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}
