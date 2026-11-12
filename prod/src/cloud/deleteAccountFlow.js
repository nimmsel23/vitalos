import { CONTACT_EMAIL, CONTACT_EMAIL_IS_PLACEHOLDER } from "./legal.js";

export const CONFIRM_PHRASE = "LÖSCHEN";

export function needsPasswordReauth(user) {
  return (user?.providerData || []).some((entry) => entry?.providerId === "password");
}

export function deletionErrorMessage(error) {
  const code = String(error?.code || "");
  if (code.includes("missing-password") || code.includes("wrong-password") || code.includes("invalid-credential")) {
    return "Das Passwort stimmt nicht. Es wurde nichts gelöscht.";
  }
  if (code.includes("unauthenticated") || code.includes("failed-precondition") || code.includes("requires-recent-login")) {
    return "Die Anmeldung ist nicht mehr frisch genug. Bitte erneut anmelden und die Löschung wiederholen.";
  }
  if (code.includes("not-found") || code.includes("unavailable") || code.includes("internal") || code.includes("unconfirmed")) {
    const contact = CONTACT_EMAIL_IS_PLACEHOLDER
      ? "Die Webseite Konto löschen beschreibt den Weg ohne App. Eine erreichbare Kontaktadresse fehlt noch."
      : `Schreib an ${CONTACT_EMAIL}, wir löschen das Konto dann für dich.`;
    return `Die Löschung ist auf dem Server gerade nicht erreichbar. ${contact}`;
  }
  return "Die Löschung ist fehlgeschlagen. Es wurden keine Daten als gelöscht bestätigt.";
}

export async function runAccountDeletion({ user, password, reauthenticate, callDelete, clearLocal }) {
  if (!user?.uid) {
    const error = new Error("Nicht angemeldet.");
    error.code = "unauthenticated";
    throw error;
  }
  if (needsPasswordReauth(user) && !password) {
    const error = new Error("Passwort fehlt.");
    error.code = "missing-password";
    throw error;
  }
  await reauthenticate({ user, password });
  const result = await callDelete(user);
  if (!result?.ok) {
    const error = new Error("Die Löschung wurde nicht bestätigt.");
    error.code = "unconfirmed";
    throw error;
  }
  if (clearLocal) await clearLocal();
  return result;
}
