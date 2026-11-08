import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const productRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const metaRoot = resolve(productRoot, '..');
export const git = (cwd, args) => execFileSync('git', args, {
  cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
}).trim();
export const apps = ['fitness-app', 'fuel-app', 'journal-app', 'habit-app',
  'learn-app', 'relax-app', '6pack-app', 'plan-app', 'skills-app'];

export function checkSharedLayout() {
  assert.equal(realpathSync(git(productRoot, ['rev-parse', '--show-toplevel'])), realpathSync(metaRoot));
  for (const path of ['.git', '.gitmodules', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', ...apps]) {
    assert(!existsSync(resolve(productRoot, path)), `prod/${path} duplicates parent ownership`);
  }
  const workspace = readFileSync(resolve(metaRoot, 'pnpm-workspace.yaml'), 'utf8');
  assert.match(workspace, /^\s*-\s*["']?prod["']?\s*$/m);
  const lock = readFileSync(resolve(metaRoot, 'pnpm-lock.yaml'), 'utf8');
  assert.match(lock, /^  prod:\s*$/m, 'Shared lockfile has no prod importer; finish pnpm install --lockfile-only');
  const pins = {};
  for (const app of apps) {
    const path = resolve(metaRoot, app);
    assert(existsSync(resolve(path, '.git')), `${app} is not initialized`);
    const entry = git(metaRoot, ['ls-tree', 'HEAD', '--', app]).split(/\s+/);
    assert.equal(entry[0], '160000', `${app} is not a committed submodule`);
    assert.equal(git(path, ['rev-parse', 'HEAD']), entry[2], `${app} differs from its parent pin`);
    assert.equal(git(path, ['status', '--porcelain', '--untracked-files=no']), '', `${app} contains tracked edits`);
    pins[app] = entry[2];
  }
  assert.equal(JSON.parse(readFileSync(resolve(productRoot, 'package.json'))).name, '@vitalos/product');
  return pins;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pins = checkSharedLayout();
  console.log('PASS: tracked prod/ uses the nine clean, committed sibling app pins');
  for (const [app, sha] of Object.entries(pins)) console.log(`${app} ${sha}`);
}
