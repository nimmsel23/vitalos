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
  mkdirSync(join(root, 'src/views'), { recursive: true });
  writeFileSync(join(root, 'src/views/App.jsx'), 'first');
  git('add', 'src');
  git('commit', '-qm', 'First change');
  writeFileSync(join(root, 'src/views/App.jsx'), 'second');
  git('add', 'src');
  git('commit', '-qm', 'Second change');
  return { root, git, id: git('rev-parse', 'HEAD') };
}

test('local release uses only current view changes and a safe GitHub origin', t => {
  const {root, id} = fixture(t);
  const release = readVosReleaseInfo({ root, env: {} });
  assert.equal(release.id, id);
  assert.equal(release.repository, 'https://github.com/example/app');
  assert.deepEqual(release.commits.map(c => c.message), ['Second change']);
});

test('matching push event is used; parent CI metadata cannot leak into submodule', t => {
  const {root, id} = fixture(t);
  const event = join(root, 'event.json');
  writeFileSync(event, JSON.stringify({ commits: [{ id, message: 'Pushed change\nDetails', modified: ['src/views/App.jsx'] }] }));
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
  appGit('commit', '--allow-empty', '-qm', 'Initial');
  mkdirSync(join(appRoot, 'src/views'), { recursive: true });
  writeFileSync(join(appRoot, 'src/views/Habits.jsx'), 'first');
  appGit('add', 'src');
  appGit('commit', '-qm', 'Habits change');
  const apps = [{path:'habit-app',name:'Habits'}, {path:'empty-app',name:'Empty'}];
  assert.equal(readVosReleaseInfo({root:join(root,'empty-app'),env:{}}), null);
  const release = readVosShellReleaseInfo({root, apps, env:{}});
  assert.deepEqual(release.sections.map(s => s.appName), ['VitalOS', 'Habits']);
  assert.equal(release.sections[1].repository, 'https://github.com/example/habits');
  assert.equal(release.sections[1].commits[0].message, 'Habits change');
  assert.equal(readVosShellReleaseInfo({root, apps, env:{}}).id, release.id);
  writeFileSync(join(appRoot, 'src/views/Habits.jsx'), 'second');
  appGit('add', 'src');
  appGit('commit', '-qm', 'Another Habits update');
  assert.notEqual(readVosShellReleaseInfo({root, apps, env:{}}).id, release.id);
  assert.equal(git('log','-1','--format=%s'), 'Second change');
  const plugin = vosChangelog({appId:'vitalos',shell:true,apps});
  plugin.configResolved({root});
  assert.match(plugin.load(plugin.resolveId('virtual:vos-changelog')), /Another Habits update/);
  assert.equal(plugin.transformIndexHtml.handler()[0].injectTo, 'head-prepend');
});

test('wrapper uses the owning app repository instead of a non-repository build root', t => {
  const { root, id } = fixture(t);
  const wrapper = join(root, 'wrapper');
  mkdirSync(wrapper);
  const plugin = vosChangelog({ appId: 'wrapper', releaseRoot: root });
  plugin.configResolved({ root: wrapper });
  let asset;
  plugin.generateBundle.call({ emitFile: file => { asset = file; } });
  assert.equal(JSON.parse(asset.source).id, id);
});

test('push notes exclude maintenance, docs and tests, and collapse repeated product fixes', t => {
  const { root, id } = fixture(t);
  const event = join(root, 'event.json');
  const commit = (message, path = 'src/views/App.jsx', sha = id) => ({ id: sha, message, modified: [path] });
  writeFileSync(event, JSON.stringify({ commits: [
    commit('chore: bump release'), commit('refactor: move helpers'),
    commit('Merge branch dev'), commit('fix(deps): update packages'),
    commit('fix: documentation', 'src/views/APP.md'),
    commit('fix: test runner', 'src/views/App.test.jsx'),
    commit('fix: fixtures', 'src/views/__tests__/fixture.js'),
    commit('feat: New exercise picker', 'src/views/Picker.jsx', 'a'.repeat(40)),
    commit('fix: Music keeps playing', 'src/views/Runner.jsx', 'b'.repeat(40)),
    commit('fix(runner): Music keeps playing.'),
    commit('feat: Water tracker', 'src/client/views/Water.jsx', 'c'.repeat(40)),
  ] }));
  const release = readVosReleaseInfo({ root, env: { GITHUB_EVENT_PATH: event, GITHUB_SHA: id, GITHUB_REPOSITORY: 'example/app' } });
  assert.deepEqual(release.commits, [
    { sha: 'a'.repeat(40), message: 'New exercise picker' },
    { sha: id, message: 'Music keeps playing.' },
    { sha: 'c'.repeat(40), message: 'Water tracker' },
  ]);
});

test('local history applies the same product filter and returns no empty changelog', t => {
  const { root, git } = fixture(t);
  writeFileSync(join(root, 'src/views/App.test.jsx'), 'test');
  git('add', 'src');
  git('commit', '-qm', 'fix: tests');
  assert.equal(readVosReleaseInfo({ root, env: {} }), null);
  writeFileSync(join(root, 'src/views/App.jsx'), 'technical');
  git('add', 'src');
  git('commit', '-qm', 'chore: release metadata');
  assert.equal(readVosReleaseInfo({ root, env: {} }), null);
  writeFileSync(join(root, 'src/views/App.jsx'), 'product');
  git('add', 'src');
  git('commit', '-qm', 'fix(player): Keep music playing');
  assert.equal(readVosReleaseInfo({ root, env: {} }).commits[0].message, 'Keep music playing');
});

test('a release merge keeps product commits from dev and drops the merge wrapper', t => {
  const { root, git } = fixture(t);
  const production = git('branch', '--show-current');
  git('checkout', '-qb', 'dev');
  writeFileSync(join(root, 'src/views/App.jsx'), 'new view');
  git('add', 'src');
  git('commit', '-qm', 'feat: Improved training overview');
  git('checkout', '-q', production);
  git('merge', '--no-ff', '-qm', 'Merge dev for release', 'dev');
  assert.deepEqual(readVosReleaseInfo({ root, env: {} }).commits.map(c => c.message), ['Improved training overview']);
});
