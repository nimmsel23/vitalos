/** Texte für „Passwort vergessen“ (Firebase Auth, nur E-Mail-Konten). */

export const PASSWORD_RESET_SENT =
  "Wir haben dir einen Link zum Zurücksetzen an diese E-Mail geschickt.";

export const PASSWORD_RESET_NEED_EMAIL =
  "Bitte zuerst die E-Mail-Adresse eingeben.";

export function passwordResetFailure(error) {
  const code = String(error?.code || "");
  if (code === "auth/invalid-email") return "Diese E-Mail-Adresse ist ungültig.";
  if (code === "auth/missing-email") return PASSWORD_RESET_NEED_EMAIL;
  if (code === "auth/user-not-found") return "Zu dieser E-Mail gibt es kein E-Mail-Konto.";
  if (code === "auth/too-many-requests") return "Zu viele Versuche. Bitte später erneut versuchen.";
  if (code === "auth/network-request-failed") return "Keine Verbindung. Bitte später erneut versuchen.";
  return "Der Link konnte nicht gesendet werden. Bitte prüfe die Adresse und versuche es erneut.";
}
