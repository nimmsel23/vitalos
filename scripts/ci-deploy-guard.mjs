#!/usr/bin/env node
/**
 * CI-Guard: Blockiert jeden direkten firebase deploy der nicht in GitHub Actions läuft.
 * Wird als predeploy-Hook in firebase.json aufgerufen.
 *
 * Lokal: firebase deploy → dieser Script → exit(1) → Deploy abgebrochen
 * CI:    GITHUB_ACTIONS=true gesetzt → Deploy erlaubt
 *
 * Für lokale Preview-Tests: npm run deploy:preview (Firebase channel, kein Live-Deploy)
 */

if (!process.env.GITHUB_ACTIONS) {
  console.error("");
  console.error("⛔  Direkter firebase deploy ist nicht erlaubt.");
  console.error("");
  console.error("    Live-Deploys laufen ausschließlich über GitHub Actions CI.");
  console.error("    Für einen lokalen Preview-Test:");
  console.error("");
  console.error("      npm run deploy:preview");
  console.error("");
  console.error("    → Deployt auf einen temporären Preview-Channel (3 Tage).");
  console.error("    → Berührt nie die Live-Site.");
  console.error("");
  process.exit(1);
}
