/**
 * Auswahl der authDomain für die private Shell (vitalos.web.app).
 * Kein Firebase-Import: der Test und die Init lesen dieselbe Entscheidung.
 *
 * Safari/ITP verwirft die Google-Session, wenn signInWithRedirect über eine
 * fremde authDomain läuft. Same-origin ist nur sicher, wenn
 * https://<host>/__/auth/handler als Redirect-URI registriert ist.
 * Stand 2026-11-18: nur vitalos.web.app. Andere Hosting-Sites, Previews,
 * localhost und Capacitor bleiben bei der Projekt-Domain.
 */

const SAME_ORIGIN_AUTH_HOSTS = Object.freeze(["vitalos.web.app"]);

function normalizeHost(hostname) {
  return String(hostname || "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
}

export function isCapacitorNative(scope = globalThis) {
  const capacitor = scope?.Capacitor;
  if (typeof capacitor?.isNativePlatform !== "function") return false;
  try {
    return capacitor.isNativePlatform() === true;
  } catch {
    // Unklarer nativer Kontext: authDomain nicht umschreiben.
    return true;
  }
}

/**
 * @param {string} configured Projekt-authDomain aus firebase.config.js
 * @param {string} hostname location.hostname
 * @param {{ native?: boolean }} [options] native true = Capacitor/Android unverändert
 * @returns {string}
 */
export function resolveShellAuthDomain(configured, hostname, options = {}) {
  const configuredDomain = String(configured || "").trim();
  if (options.native === true) return configuredDomain;
  const host = normalizeHost(hostname);
  if (SAME_ORIGIN_AUTH_HOSTS.includes(host)) return host;
  return configuredDomain;
}
