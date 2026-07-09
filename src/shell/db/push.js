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
