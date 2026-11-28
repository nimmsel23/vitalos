import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createStore } from 'zustand/vanilla'
import { QueryClient } from '@tanstack/react-query'
import { createAccountState } from '../src/shell/accountState.js'
import { readHashState, buildHashState } from '../src/shell/hashState.js'
import { isISODate } from '../src/shell/runtimeDate.js'
import { shellQueryClient } from '../src/shell/queryClient.js'
import { withActivityRefresh, ACTIVITY_QUERY_KEY } from '../src/shell/activityChanges.js'

test('every Shell subtab survives a URL round trip', () => {
  globalThis.window = { location: { hash: '' } }
  const groups = {
    fuel: ['log', 'food', 'supplements', 'micros', 'pots', 'kitchen', 'log-dashboard', 'log-timeline', 'tapboard', 'shutter', 'tagesfaden'],
    fitness: ['pulse', 'gate', 'session', 'today', 'plan', 'history', 'review', 'report', 'muscles', 'readiness', 'strength', 'verlauf', 'learn', 'exercises', 'anatomy', 'quiz', 'inbox'],
    relax: ['dash', 'session', 'journal', 'ausbildung', 'atem', 'stats', 'physio', 'catalog'],
    door: ['potential', 'plan', 'production', 'profit'],
    game: ['fire', 'focus', 'freedom', 'frame', 'voice', 'door/potential', 'door/plan', 'door/production', 'door/profit'],
    home: [null, 'hub', 'fitness'],
    sixpack: ['track', 'session/test'],
    skills: ['handstand'],
  }
  for (const [tab, subTabs] of Object.entries(groups)) {
    for (const subTab of subTabs) {
      window.location.hash = buildHashState({ tab, subTab, date: '2026-11-27' })
      const parsed = readHashState()
      assert.equal(parsed.tab, tab, window.location.hash)
      assert.equal(parsed.subTab, subTab, window.location.hash)
      if (tab === 'fuel' || tab === 'relax' || (tab === 'home' && !subTab) || (tab === 'fitness' && subTab === 'session')) {
        assert.equal(parsed.date, '2026-11-27', window.location.hash)
      }
    }
  }
  window.location.hash = '#not-a-tab'
  assert.deepEqual(readHashState(), { tab: 'home', subTab: 'hub', date: null })
})

test('account switch clears cached data, restores only the owner and rejects late hydration', async () => {
  const storage = new Map()
  storage.setItem = storage.set.bind(storage)
  storage.getItem = storage.get.bind(storage)
  const shell = createStore(() => ({ age: 99, weightKg: 110, theme: 'vital', displayName: 'old' }))
  const fuel = createStore(() => ({ kcal_goal: 2000, age: 30, setSetting() { throw new Error('must not write cloud') } }))
  const cache = new QueryClient()
  const accounts = createAccountState(shell, fuel, cache, storage)
  accounts.switchAccount('A')
  assert.equal(shell.getState().age, 30, 'unowned historical values must not enter the cloud account')
  accounts.applyProfile('A', { age: 42, weightKg: 90, displayName: 'Alice', theme: 'other' })
  fuel.setState({ kcal_goal: 2500 })
  await cache.fetchQuery({ queryKey: ['nutrition', '2026-11-28'], queryFn: async () => 'A', staleTime: Infinity })
  accounts.switchAccount('B')
  assert.equal(cache.getQueryData(['nutrition', '2026-11-28']), undefined)
  assert.equal(shell.getState().age, 30)
  assert.equal(shell.getState().displayName, '')
  assert.equal(shell.getState().theme, 'vital')
  assert.equal(fuel.getState().kcal_goal, 2000)
  accounts.applyProfile('A', { age: 88 })
  accounts.applyFuelSettings('A', { kcal_goal: 9999 })
  assert.equal(shell.getState().age, 30)
  assert.equal(fuel.getState().kcal_goal, 2000)
  accounts.applyProfile('B', { age: 25 })
  accounts.switchAccount(null)
  accounts.switchAccount('A')
  assert.equal(shell.getState().age, 42)
  assert.equal(shell.getState().displayName, 'Alice')
  assert.equal(fuel.getState().kcal_goal, 2500)
  cache.clear()
})

test('a pending fetch from A cannot populate the cache after switching to B', async () => {
  const storage = { getItem: () => null, setItem() {} }
  const shell = createStore(() => ({}))
  const fuel = createStore(() => ({ kcal_goal: 2000 }))
  const cache = new QueryClient()
  const accounts = createAccountState(shell, fuel, cache, storage)
  accounts.switchAccount('A')
  let finish
  const pending = cache.fetchQuery({ queryKey: ['nutrition'], queryFn: () => new Promise(resolve => { finish = resolve }) }).catch(() => {})
  accounts.switchAccount('B')
  finish('private A data')
  await pending
  assert.equal(cache.getQueryData(['nutrition']), undefined)
})

test('successful writes invalidate week activity, failed writes remain errors', async () => {
  shellQueryClient.setQueryData([...ACTIVITY_QUERY_KEY, 'home'], { days: [] })
  assert.deepEqual(await withActivityRefresh(async () => ({ ok: true }))(), { ok: true })
  assert.equal(shellQueryClient.getQueryState([...ACTIVITY_QUERY_KEY, 'home']).isInvalidated, true)
  await assert.rejects(withActivityRefresh(async () => { throw new Error('save failed') })(), /save failed/)
  shellQueryClient.clear()
})

test('date controls reject empty and impossible calendar dates', () => {
  for (const value of ['', null, '2026-02-30', 'NaN-NaN-NaN', '2026-13-01']) assert.equal(isISODate(value), false)
  for (const value of ['2026-11-28', '2024-02-29']) assert.equal(isISODate(value), true)
})

test('the actual Shell store keeps its last valid date when a date input is cleared', async () => {
  const { readFile } = await import('node:fs/promises')
  const values = new Map([['vitalos-runtimeDate', 'broken-date']])
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)) }
  const source = (await readFile(new URL('../src/shell/store.js', import.meta.url), 'utf8'))
    .replace('@fitness/src/store/settingsStore.js', new URL('../fitness-app/src/store/settingsStore.js', import.meta.url).href)
    .replace('./runtimeDate.js', new URL('../src/shell/runtimeDate.js', import.meta.url).href)
  const { useShellSettings } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  assert.equal(isISODate(useShellSettings.getState().runtimeDate), true)
  useShellSettings.getState().setRuntimeDate('2026-11-27')
  useShellSettings.getState().setRuntimeDate('')
  useShellSettings.getState().setRuntimeDate('2026-02-30')
  assert.equal(useShellSettings.getState().runtimeDate, '2026-11-27')
  assert.equal(values.get('vitalos-runtimeDate'), '2026-11-27')
})
