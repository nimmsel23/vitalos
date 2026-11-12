/** Texte für „Passwort vergessen“ (Firebase Auth, nur E-Mail-Konten). */

export const PASSWORD_RESET_SENT =
  "Falls ein Konto mit dieser E-Mail-Adresse existiert, erhältst du eine Nachricht zum Zurücksetzen.";

export const PASSWORD_RESET_NEED_EMAIL =
  "Bitte zuerst die E-Mail-Adresse eingeben.";

/** Erfolg und „kein Konto“ sind dieselbe Meldung, damit die Anmeldung keine Konten aufzählt. */
export function passwordResetNotice(error) {
  const code = String(error?.code || "");
  if (!error || code === "auth/user-not-found") return { ok: true, message: PASSWORD_RESET_SENT };
  return { ok: false, message: passwordResetFailure(error) };
}

export function passwordResetFailure(error) {
  const code = String(error?.code || "");
  if (code === "auth/invalid-email") return "Diese E-Mail-Adresse ist ungültig.";
  if (code === "auth/missing-email") return PASSWORD_RESET_NEED_EMAIL;
  if (code === "auth/too-many-requests") return "Zu viele Versuche. Bitte später erneut versuchen.";
  if (code === "auth/network-request-failed") return "Keine Verbindung. Bitte später erneut versuchen.";
  return "Der Link konnte nicht gesendet werden. Bitte prüfe die Adresse und versuche es erneut.";
}
