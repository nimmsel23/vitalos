/**
 * User-Profil & Push-Notification-Settings
 *
 * Shell-eigen: users/{uid} und fitness/{uid}/settings/push
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../cloud/firebase.js";
import { getUid } from "./fitness.js";

// --- Profile ---
// Gemeinsames Profil (app-übergreifend, fuel/fitness/vitalos): users/{uid}/meta/profile —
// nur Felder mit gleicher Bedeutung in jeder App. Alles andere (Anamnese, split, …)
// bleibt im Root-Dokument users/{uid}, das weiterhin mitgeschrieben wird.
const SHARED_PROFILE_FIELDS = ["gender", "age", "heightCm", "weightKg", "chronicConditions", "medications"];

function pickShared(data) {
  const out = {};
  for (const k of SHARED_PROFILE_FIELDS) if (data?.[k] !== undefined && data[k] !== null && data[k] !== "") out[k] = data[k];
  if (out.gender === "male") out.gender = "m";
  if (out.gender === "female") out.gender = "f";
  return out;
}

export async function getUserProfile(uid) {
  const [rootSnap, sharedSnap] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDoc(doc(db, "users", uid, "meta", "profile")),
  ]);
  const root = rootSnap.exists() ? rootSnap.data() : null;
  const shared = sharedSnap.exists() ? pickShared(sharedSnap.data()) : {};
  // Gemeinsames Profil gewinnt; fehlende Felder werden einmalig aus dem Altbestand übernommen.
  const backfill = {};
  for (const [k, v] of Object.entries(pickShared(root))) if (shared[k] === undefined) backfill[k] = v;
  if (Object.keys(backfill).length && uid === getUid()) {
    try {
      await setDoc(doc(db, "users", uid, "meta", "profile"), { ...backfill, updated_at: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.error("Profil-Backfill fehlgeschlagen:", e);
    }
  }
  if (!root && !Object.keys(shared).length) return null;
  return { ...root, ...backfill, ...shared };
}

export async function updateUserProfile(uid, data) {
  try {
    await setDoc(doc(db, "users", uid), {
      ...data,
      updated_at: serverTimestamp(),
    }, { merge: true });
    const shared = pickShared(data);
    if (Object.keys(shared).length) {
      await setDoc(doc(db, "users", uid, "meta", "profile"), {
        ...shared,
        updated_at: serverTimestamp(),
      }, { merge: true });
    }
    return true;
  } catch (e) {
    console.error("updateUserProfile failed:", e);
    return false;
  }
}

// --- Devices ---
// users/{uid}/devices/{deviceId}, Schema wie fuel-dev/fitness-dev (`app` + `prefs.<app>`).
// Bewusst nur als registerShellDevice exportiert: die Barrel-Wildcards aus fuel/fitness
// exportieren bereits getDevice/registerDevice.
const SHELL_DEVICE_ID_KEY = "vitalos-device-id";

function shellDeviceId() {
  try {
    let id = localStorage.getItem(SHELL_DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SHELL_DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function shellDeviceLabel() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const os = /Android/i.test(ua) ? "Android"
    : /iPhone|iPad|iPod/i.test(ua) ? "iOS"
    : /Windows/i.test(ua) ? "Windows"
    : /Mac OS X/i.test(ua) ? "macOS"
    : /Linux/i.test(ua) ? "Linux"
    : "Gerät";
  const browser = /Edg\//.test(ua) ? "Edge"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "Browser";
  return `${os} · ${browser}`;
}

export async function registerShellDevice() {
  const id = shellDeviceId();
  const uid = getUid();
  if (!id || !uid) return;
  try {
    const ref = doc(db, "users", uid, "devices", id);
    const existing = await getDoc(ref);
    await setDoc(ref, {
      app: "vitalos",
      label: shellDeviceLabel(),
      ...(existing.exists() && existing.data().registered_at ? {} : { registered_at: serverTimestamp() }),
      last_seen_at: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.error("Geräte-Registrierung fehlgeschlagen:", e);
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
