#!/usr/bin/env node
// Import committed Coach rules without adding Coach as a VitalOS app/submodule.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(process.argv[2] || resolve(homedir(), 'dev/coach-dev'));
const ref = process.argv[3] || 'HEAD';
const git = (...args) => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trimEnd();
const commit = git('rev-parse', '--verify', `${ref}^{commit}`);
const rules = git('show', `${commit}:firestore.rules.part`);
if (!rules.includes('match /coachConversations/')) throw new Error('Coach conversation fragment missing.');
mkdirSync(resolve(root, 'firestore'), { recursive: true });
writeFileSync(resolve(root, 'firestore/coach.rules.part'), `// Imported from nimmsel23/coach-dev @ ${commit}; source: firestore.rules.part\n${rules}\n`);
console.log(`Coach rules imported from ${commit}. Run node scripts/build-rules.mjs before the central rules deployment.`);
