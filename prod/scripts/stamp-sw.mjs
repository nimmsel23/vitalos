// Stempelt eine eindeutige Cache-Busting-Version in den BUILD-OUTPUT
// (dist/ oder dist-firebase/), nie in die getrackte Quelle unter public/.
// Vorher mutierte bump-sw.mjs public/sw.js + public/manifest.json direkt,
// ohne den Bump ins Repo zurückzucommitten — die CI startete dadurch bei
// jedem Run wieder von der eingefrorenen Git-Version (v150), bumpte lokal
// auf v151 und verwarf das danach. Die Live-Site blieb so für immer bei
// v151 hängen. Ein Zeitstempel macht jeden Build automatisch eindeutig —
// kein persistenter Zähler und kein Rückschreiben ins Repo nötig.
// Gleiches Muster wie fitness-app/scripts/stamp-sw.mjs.
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, process.argv[2] || "dist-firebase");
const sw = resolve(outDir, "sw.js");
const manifest = resolve(outDir, "manifest.json");

const version = Date.now().toString(36); // kompakter, monoton wachsender Stempel

if (existsSync(sw)) {
  const content = readFileSync(sw, "utf8");
  const stamped = content.replace(/vitalos-v0\b/, `vitalos-v${version}`);
  writeFileSync(sw, stamped);
  console.log(`🔢 ${outDir}/sw.js: CACHE → vitalos-v${version}`);
} else {
  console.log(`⚠️  ${sw} nicht gefunden — skip`);
}

if (existsSync(manifest)) {
  const data = JSON.parse(readFileSync(manifest, "utf8"));
  data.version = version;
  writeFileSync(manifest, JSON.stringify(data, null, 2) + "\n");
  console.log(`🔢 ${outDir}/manifest.json: version → ${version}`);
} else {
  console.log(`⚠️  ${manifest} nicht gefunden — skip`);
}
