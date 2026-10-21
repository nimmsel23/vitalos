import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { readVosReleaseInfo, readVosShellReleaseInfo } from '../vos-release-info.mjs';
import { vosChangelog } from '../vos-changelog-vite.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'vos-release-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  git('init', '-q');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'Release Test');
  git('remote', 'add', 'origin', 'git@github.com:example/app.git');
  git('commit', '--allow-empty', '-qm', 'First change');
  git('commit', '--allow-empty', '-qm', 'Second change');
  return { root, git, id: git('rev-parse', 'HEAD') };
}

test('local release uses app HEAD and GitHub origin with recent changes', t => {
  const {root, id} = fixture(t);
  const release = readVosReleaseInfo({ root, env: {} });
  assert.equal(release.id, id);
  assert.equal(release.repository, 'https://github.com/example/app');
  assert.deepEqual(release.commits.map(c => c.message), ['Second change', 'First change']);
});

test('matching push event is used; parent CI metadata cannot leak into submodule', t => {
  const {root, id} = fixture(t);
  const event = join(root, 'event.json');
  writeFileSync(event, JSON.stringify({ commits: [{ id, message: 'Pushed change\nDetails' }] }));
  const env = { GITHUB_EVENT_PATH: event, GITHUB_SHA: id, GITHUB_REPOSITORY: 'example/app' };
  assert.deepEqual(readVosReleaseInfo({root, env}).commits, [{sha: id, message: 'Pushed change'}]);
  for (const mismatch of [{ GITHUB_SHA: 'f'.repeat(40) }, { GITHUB_REPOSITORY: 'example/parent' }]) {
    assert.equal(readVosReleaseInfo({root, env: {...env, ...mismatch}}).commits[0].message, 'Second change');
  }
  writeFileSync(event, '{invalid');
  assert.equal(readVosReleaseInfo({root, env}).commits[0].message, 'Second change');
});

test('missing Git history disables release metadata cleanly', t => {
  const root = mkdtempSync(join(tmpdir(), 'vos-no-git-'));
  t.after(() => rmSync(root, {recursive:true, force:true}));
  assert.equal(readVosReleaseInfo({root, env:{}}), null);
});

test('Vite virtual module and diagnostic JSON share exactly the same app release', t => {
  const {root, id} = fixture(t);
  const plugin = vosChangelog({appId:'test', appName:'Test'});
  plugin.configResolved({root});
  const virtual = plugin.resolveId('virtual:vos-changelog');
  assert.equal(plugin.resolveId('unrelated'), undefined);
  assert.match(plugin.load(virtual), new RegExp(id));
  const tags = plugin.transformIndexHtml.handler();
  assert.equal(tags[0].attrs.type, 'module');
  let asset;
  plugin.generateBundle.call({emitFile: file => { asset = file; }});
  assert.equal(asset.fileName, 'release-info.json');
  assert.equal(JSON.parse(asset.source).id, id);
});

test('one shell release combines app repos and ignores uninitialized app directories', t => {
  const { root, git } = fixture(t);
  const appRoot = join(root, 'habit-app');
  mkdirSync(appRoot);
  mkdirSync(join(root, 'empty-app'));
  const appGit = (...args) => execFileSync('git', ['-C', appRoot, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  appGit('init', '-q');
  appGit('config', 'user.email', 'test@example.invalid');
  appGit('config', 'user.name', 'Release Test');
  appGit('remote', 'add', 'origin', 'git@github.com:example/habits.git');
  appGit('commit', '--allow-empty', '-qm', 'Habits change');
  const apps = [{path:'habit-app',name:'Habits'}, {path:'empty-app',name:'Empty'}];
  assert.equal(readVosReleaseInfo({root:join(root,'empty-app'),env:{}}), null);
  const release = readVosShellReleaseInfo({root, apps, env:{}});
  assert.deepEqual(release.sections.map(s => s.appName), ['VitalOS', 'Habits']);
  assert.equal(release.sections[1].repository, 'https://github.com/example/habits');
  assert.equal(release.sections[1].commits[0].message, 'Habits change');
  assert.equal(readVosShellReleaseInfo({root, apps, env:{}}).id, release.id);
  appGit('commit', '--allow-empty', '-qm', 'Another Habits update');
  assert.notEqual(readVosShellReleaseInfo({root, apps, env:{}}).id, release.id);
  assert.equal(git('log','-1','--format=%s'), 'Second change');
  const plugin = vosChangelog({appId:'vitalos',shell:true,apps});
  plugin.configResolved({root});
  assert.match(plugin.load(plugin.resolveId('virtual:vos-changelog')), /Habits change/);
  assert.equal(plugin.transformIndexHtml.handler()[0].injectTo, 'head-prepend');
});
