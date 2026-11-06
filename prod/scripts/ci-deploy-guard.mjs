#!/usr/bin/env node
/**
 * CI-Guard: Fragt bei jedem direkten firebase deploy der nicht in GitHub
 * Actions läuft explizit nach, statt hart zu blockieren (seit 2026-08-25 —
 * der harte exit(1) nervte im Alltag; die eigentliche Absicht war, ein
 * *versehentliches* lokales Live-Deploy zu verhindern, nicht ein bewusstes).
 * Wird als predeploy-Hook in firebase.json aufgerufen.
 *
 * Lokal: firebase deploy → dieser Script → Rückfrage (gum confirm / y-N) → OK oder Abbruch
 * CI:    GITHUB_ACTIONS=true gesetzt → Deploy ohne Rückfrage erlaubt
 *
 * Für lokale Preview-Tests weiterhin: npm run deploy:preview (Firebase channel, kein Live-Deploy)
 */

import { spawnSync } from "node:child_process";

if (process.env.GITHUB_ACTIONS) {
  process.exit(0);
}

console.error("");
console.error("⚠️  Direkter lokaler firebase deploy — normalerweise läuft das über GitHub Actions CI.");
console.error("    Für einen risikofreien Preview-Test: npm run deploy:preview");
console.error("");

function haveGum() {
  return spawnSync("command", ["-v", "gum"], { shell: true }).status === 0;
}

function confirmed() {
  if (haveGum()) {
    const res = spawnSync(
      "gum",
      ["confirm", "Live-Deploy trotzdem jetzt lokal durchführen?"],
      { stdio: "inherit" }
    );
    return res.status === 0;
  }
  const res = spawnSync(
    "bash",
    ["-c", 'read -r -p "Live-Deploy trotzdem jetzt lokal durchführen? [y/N] " ans < /dev/tty; [[ "$ans" =~ ^([yY]|[jJ][aA]?)$ ]]'],
    { stdio: "inherit" }
  );
  return res.status === 0;
}

if (!confirmed()) {
  console.error("⛔  Abgebrochen.");
  process.exit(1);
}
