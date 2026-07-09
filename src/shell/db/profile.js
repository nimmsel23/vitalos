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
