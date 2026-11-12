import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildHashState, readHashState } from '../src/shell/hashState.js';

const root = fileURLToPath(new URL('..', import.meta.url));

function withHash(hash, fn) {
  const previous = globalThis.window;
  globalThis.window = { location: { hash } };
  try {
    return fn();
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
}

test('deep links round-trip and legacy hashes still resolve', () => {
  const cases = [
    ['#sixpack', 'sixpack', null, '#sixpack'],
    ['#sixpack/skills', 'sixpack', 'skills', '#sixpack/skills'],
    ['#sixpack/skills/front-lever', 'sixpack', 'skills/front-lever', '#sixpack/skills/front-lever'],
    ['#sixpack/day/3', 'sixpack', 'day/3', '#sixpack/day/3'],
    ['#skills', 'skills', null, '#skills'],
    ['#skills/front-lever', 'skills', 'front-lever', '#skills/front-lever'],
    ['#skills?skill=front-lever', 'skills', 'front-lever', '#skills/front-lever'],
    ['#?skill=front-lever', 'skills', 'front-lever', '#skills/front-lever'],
    ['#timer', 'sixpack', null, '#sixpack'],
    ['#fitness/timer', 'sixpack', null, '#sixpack'],
    ['#fitness/skills', 'skills', null, '#skills'],
    ['#fitness/skills?skill=planche', 'skills', 'planche', '#skills/planche'],
  ];
  for (const [hash, tab, subTab, canonical] of cases) {
    const state = withHash(hash, () => readHashState());
    assert.equal(state.tab, tab, hash);
    assert.equal(state.subTab, subTab, hash);
    const built = buildHashState({ tab: state.tab, subTab: state.subTab, date: null });
    assert.equal(built, canonical, hash);
    const again = withHash(built, () => readHashState());
    assert.equal(again.tab, state.tab, canonical);
    assert.equal(again.subTab, state.subTab, canonical);
    assert.equal(withHash(built, () => buildHashState({ tab: again.tab, subTab: again.subTab })), canonical, canonical);
  }
});

test('existing shell hashes keep their tabs', async () => {
  assert.equal(withHash('#hub', () => readHashState()).tab, 'home');
  assert.equal(withHash('#food', () => readHashState()).subTab, 'food');
  assert.equal(withHash('#game/door/potential', () => readHashState()).subTab, 'door/potential');
  const session = withHash('#session', () => readHashState());
  assert.equal(session.tab, 'fitness');
  assert.equal(session.subTab, 'session');
  const nav = await readFile(new URL('../src/shell/NavigationItems.js', import.meta.url), 'utf8');
  const block = nav.slice(nav.indexOf('export const NAV_ITEMS'), nav.indexOf('export const VALID_TABS'));
  const ids = [...block.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1]);
  assert.ok(ids.includes('skills') && ids.includes('sixpack'));
  for (const id of ids) {
    const state = withHash(`#${id}`, () => readHashState());
    assert.equal(state.tab, id, `#${id}`);
  }
});

test('shell wrappers mount the embed entries and do not paint the document', async () => {
  const sixpack = await readFile(new URL('../src/shell/SixPackApp.jsx', import.meta.url), 'utf8');
  const skills = await readFile(new URL('../src/shell/SkillsApp.jsx', import.meta.url), 'utf8');
  const vite = await readFile(new URL('../vite.config.js', import.meta.url), 'utf8');
  const nav = await readFile(new URL('../src/shell/NavigationItems.js', import.meta.url), 'utf8');
  const hub = await readFile(new URL('../src/shell/Hub.jsx', import.meta.url), 'utf8');
  const more = await readFile(new URL('../src/shell/layout/MobileNav.jsx', import.meta.url), 'utf8');
  for (const source of [sixpack, skills]) {
    assert.doesNotMatch(source, /document\.documentElement/);
    assert.doesNotMatch(source, /location\.hash\s*=/);
    assert.doesNotMatch(source, /history\.(push|replace)State/);
    assert.match(source, /shellSyncTargetRef/);
    assert.match(source, /<ErrorBoundary>/);
    assert.match(source, /onWorkoutComplete=\{onWorkoutComplete\}/);
    assert.match(source, /uid=\{uid\}/);
  }
  assert.match(sixpack, /SixPackEmbed/);
  assert.match(sixpack, /firebaseApp=\{firebaseApp\}/);
  assert.match(sixpack, /loadRemoteProgram=\{loadProgram\}/);
  assert.match(sixpack, /onNavigate=\{onNavigate\}/);
  assert.match(skills, /SkillsEmbed/);
  assert.match(skills, /design=\{design\}/);
  assert.match(skills, /onNavigate=\{onNavigate\}/);
  assert.match(vite, /skills-app\/data\/cloud\.js|SKILLS_CLOUD/);
  assert.match(nav, /id: 'sixpack'[\s\S]*standaloneUrl: 'https:\/\/vos-6pack\.web\.app'/);
  assert.match(hub, /id: 'skills'/);
  assert.match(more, /MORE_IDS = \[[^\]]*'skills'/);
});

function runNode(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  }
}

test('embedded 6Pack and Skills leave documentElement theme and hash alone', () => {
  if (!existsSync(new URL('../6pack-app/sixpackData.generated.js', import.meta.url))) {
    runNode(['6pack-app/build-data.mjs']);
  }
  runNode(['--test', '--test-force-exit', '6pack-app/scripts/test-embed.mjs']);
  runNode(['--test', '--test-force-exit', 'skills-app/tests/embed.test.mjs']);
});
