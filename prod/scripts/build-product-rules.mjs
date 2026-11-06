import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = readFileSync(resolve(root, 'firestore.rules'), 'utf8');
const coach = /    \/\/ Coach = Custom Claim[\s\S]*?    function isCoach\(\) \{[\s\S]*?\n    \}/g;
const matches = [...input.matchAll(coach)];
if (matches.length !== 1 || !matches[0][0].includes('roles/$(request.auth.uid)')) {
  throw new Error('Private coach rule changed; review the product transformation before generating rules');
}
let output = input.replace(coach, '    // Product accounts have no cross-user coach access.\n    function isCoach() { return false; }')
  .replace(/(rules_version = '2';)[\s\S]*?(service cloud\.firestore)/, '$1\n\n// Generated product rules for vitalos-prod from firestore.rules. Review before deployment.\n\n$2');
// The inherited collection-group rules trust a document's userId rather than
// its owner path. In particular, habitJournals allows an attacker to write
// another user's document. The product uses owner-scoped paths instead.
for (const collection of ['inbox', 'sessions', 'habitJournals', 'journal']) {
  const pattern = new RegExp(`^    match /\\{path=\\*\\*\\}/${collection}/\\{[^}]+\\} \\{[\\s\\S]*?^    \\}`, 'gm');
  const groupMatches = [...output.matchAll(pattern)];
  if (groupMatches.length !== 1) throw new Error(`Review changed collection-group rule: ${collection}`);
  output = output.replace(pattern, `    // Product: ${collection} access is owner-scoped.`);
}
const target = resolve(root, 'firestore.product.rules');
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Product rules are stale; regenerate and review');
  console.log('Product rules match the reviewed transformation');
} else {
  writeFileSync(target, output);
  console.log('Generated product rules; review before deployment');
}
