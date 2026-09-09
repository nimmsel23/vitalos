/**
 * User-Profil & Push-Notification-Settings
 *
 * Shell-eigen: users/{uid} und fitness/{uid}/settings/push
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../cloud/firebase.js";
import { getUid } from "./fitness.js";

// --- Profile ---
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

// --- Push Settings ---
const DEFAULT_PUSH_SETTINGS = {
  enabled: false,
  token: null,
  tokens: [],
  reminderTime: "18:00",
  types: { workout: true, activeWorkout: true, habit: true, coverage: true, pplRatio: true, restday: true },
};

export async function getPushSettings() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "push"));
  if (!snap.exists()) return DEFAULT_PUSH_SETTINGS;
  const data = snap.data() || {};
  const tokens = Array.from(new Set([
    ...(Array.isArray(data.tokens) ? data.tokens : []),
    ...(data.token ? [data.token] : []),
  ].filter(Boolean)));
  return {
    ...DEFAULT_PUSH_SETTINGS,
    ...data,
    token: tokens[0] || data.token || null,
    tokens,
  };
}

export async function savePushSettings(settings) {
  await setDoc(doc(db, "fitness", getUid(), "settings", "push"), {
    ...settings,
    tokens: Array.from(new Set([
      ...(Array.isArray(settings?.tokens) ? settings.tokens : []),
      ...(settings?.token ? [settings.token] : []),
    ].filter(Boolean))),
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}
