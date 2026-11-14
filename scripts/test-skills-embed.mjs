import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
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
  assert.ok(ids.includes('skills') && !ids.includes('sixpack'));
  assert.equal(withHash('#sixpack/track', () => readHashState()).tab, 'sixpack');
  for (const app of ['skills', 'sixpack', 'relax', 'journal', 'habits', 'plan', 'learn']) {
    assert.equal(withHash(`#${app}/settings`, () => readHashState()).tab, 'settings');
  }
  for (const id of ids) {
    const state = withHash(`#${id}`, () => readHashState());
    assert.equal(state.tab, id, `#${id}`);
  }
});

test('both shells mount Core Skills with both complete embeds and shared Setup', async () => {
  const source = await readFile(new URL('../prod/src/shell/CoreSkillsApp.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /document\.documentElement|location\.hash\s*=|history\.(push|replace)State/);
  for (const contract of ['SkillsEmbed', 'SixPackEmbed', 'PersistenceStatus', 'loadRemoteProgram={loadProgram}', 'saveRemoteProgram={saveProgram}', 'onWorkoutComplete={complete}', 'localReminders={nativeReminderDelivery}', 'data-theme="skills"', '<ErrorBoundary>']) assert.ok(source.includes(contract), contract);
  const settings = await readFile(new URL('../src/shell/Settings/AppSettingsSections.jsx', import.meta.url), 'utf8');
  for (const id of ['skills', 'fuel', 'journal', 'habits', 'relax']) assert.ok(settings.includes(`id="${id}"`), id);
  for (const path of ['../src/shell/ShellAppRouter.jsx', '../prod/src/shell/ShellAppRouter.jsx']) {
    const router = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.match(router, /tab === 'skills' && <CoreSkillsApp/);
    assert.match(router, /tab === 'sixpack' && <CoreSkillsApp/);
  }
});

function runNode(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  }
}

test('embedded Skills leaves documentElement theme and hash alone', () => {
  runNode(['--test', '--test-force-exit', 'skills-app/tests/embed.test.mjs']);
});
