// Functions-Deploy zurueckgestellt bis Operate (Phase 06, Owner-Entscheid
// 2026-11-07): Die paarigen Journal-Functions laufen nur im privaten Projekt
// aus dem Backend-SOT; vitalos-prod hatte nie einen Functions-Deploy. Dieser
// Guard bleibt als Operate-Vorausarbeitung im Repo und wird bei Nicht-Deploy
// nicht ausgefuehrt — ein journal-app-Gitlink-Bump bricht nichts. Lauffaehig
// erst wieder nach Rueckfuehrung der Functions in den journal-App-Pin
// (Quelle seit journal-dev PR #28 / e6e3170 nicht mehr im Submodule).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const metaRoot = resolve(root, '..');
const journal = resolve(metaRoot, 'journal-app');
const requiredCommit = 'a1018cf474708ce5572efb5caa0995ff74c85d3a';
const fail = (message) => { console.error(`Product Journal backend: ${message}`); process.exit(1); };
if (process.env.GCLOUD_PROJECT !== 'vitalos-prod') fail('deployment requires project vitalos-prod');
const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
try {
  const pinned = git(metaRoot, ['rev-parse', 'HEAD:journal-app']);
  const current = git(journal, ['rev-parse', 'HEAD']);
  if (current !== pinned) fail('journal-app checkout does not match the committed product Gitlink');
  if (git(journal, ['status', '--porcelain', '--untracked-files=no'])) fail('journal-app contains tracked changes');
  git(journal, ['merge-base', '--is-ancestor', requiredCommit, 'HEAD']);
  const source = readFileSync(resolve(journal, 'functions/index.js'), 'utf8');
  for (const name of ['analyzeSmartLog', 'getSmartLogQuota', 'googleLinkConfig', 'googleLink', 'googleAccessToken', 'googleUnlink']) {
    if (!new RegExp(`exports\\.${name}\\s*=`).test(source)) fail(`missing callable ${name}`);
  }
} catch {
  fail('the pinned Journal revision must contain the reviewed Smart Logging and account-bound durable Google changes');
}
console.log(`Product Journal backend ready for configuration review: ${requiredCommit} is included.`);
