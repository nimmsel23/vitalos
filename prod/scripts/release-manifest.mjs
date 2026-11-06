import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { checkSharedLayout, git, metaRoot } from './check-shared-layout.mjs';

const pins = checkSharedLayout();
if (git(metaRoot, ['status', '--porcelain', '--untracked-files=normal'])) {
  throw new Error('Release manifest requires a clean meta-repository');
}
const tag = process.argv[2] || null;
const commit = git(metaRoot, ['rev-parse', 'HEAD']);
if (tag) {
  if (!/^product-[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(tag)) throw new Error('Expected a product-* release tag');
  if (git(metaRoot, ['rev-parse', `refs/tags/${tag}^{commit}`]) !== commit) {
    throw new Error('Release tag must identify the checked-out meta commit');
  }
}
const pkg = JSON.parse(readFileSync(resolve(metaRoot, 'package.json')));
console.log(JSON.stringify({
  schemaVersion: 1, commit, tag, releaseCandidate: tag === null,
  productDirectory: 'prod', firebaseProject: 'vitalos-prod',
  packageManager: pkg.packageManager,
  lockfileSha256: createHash('sha256').update(readFileSync(resolve(metaRoot, 'pnpm-lock.yaml'))).digest('hex'),
  apps: pins,
}, null, 2));
