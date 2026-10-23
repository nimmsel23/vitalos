#!/usr/bin/env node
// build-rules.mjs — bettet Modul-Fragmente (<app>/firestore.rules.part) in firestore.rules ein.
// Marker im Root-Ruleset:  // >>> module: journal-app/firestore.rules.part  …  // <<< module
// Aufruf: node scripts/build-rules.mjs [--check]   (--check: Exit 1, wenn firestore.rules veraltet ist)
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = resolve(root, "firestore.rules");
const src = readFileSync(file, "utf8");
const re = /^([ \t]*)\/\/ >>> module: (\S+)\n[\s\S]*?^[ \t]*\/\/ <<< module$/gm;
let n = 0;
const out = src.replace(re, (_, ind, part) => {
  n++;
  const body = readFileSync(resolve(root, part), "utf8").replace(/\s+$/, "");
  return `${ind}// >>> module: ${part}\n${body}\n${ind}// <<< module`;
});
if (!n) { console.error("keine Modul-Marker gefunden"); process.exit(1); }
if (process.argv.includes("--check")) {
  if (out !== src) { console.error("firestore.rules ist nicht aktuell – `node scripts/build-rules.mjs` ausführen"); process.exit(1); }
  console.log(`ok (${n} Modul(e))`);
} else {
  writeFileSync(file, out);
  console.log(`${n} Modul(e) eingebettet${out === src ? " (keine Änderung)" : ""}`);
}
