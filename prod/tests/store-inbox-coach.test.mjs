import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const prod = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function read(rel) {
  return fs.readFileSync(path.join(prod, rel), 'utf8')
}

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`)
  if (start < 0) throw new Error(`Funktion ${name} fehlt`)
  const open = source.indexOf('{', start)
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, i + 1)
    }
  }
  throw new Error(`Funktion ${name} ist nicht geschlossen`)
}

function loadResolve(storeBuild) {
  const source = read('src/shell/FitnessApp.jsx')
  const code = extractFunction(source, 'resolveFitnessRoute')
  return vm.runInNewContext(`${code}\nresolveFitnessRoute`, { STORE_BUILD: storeBuild })
}

function loadHash(storeBuild) {
  const source = read('src/App.jsx')
  const start = source.indexOf('function localToday(')
  const fnAt = source.indexOf('function readHashState(', start)
  const code = `${source.slice(start, fnAt)}${extractFunction(source.slice(fnAt), 'readHashState')}`
  return vm.runInNewContext(`
    ${code}
    (hash) => {
      window.location.hash = hash
      return readHashState()
    }
  `, {
    STORE_BUILD: storeBuild,
    VALID_TABS: new Set(['hub', 'journal', 'home', 'fitness', 'coach', 'settings']),
    localISO: () => '2026-11-12',
    window: { location: { hash: '' } },
  })
}

function loadCoachButton(storeBuild) {
  const source = read('src/shell/layout/Sidebar.jsx')
  const code = extractFunction(source, 'showCoachButton')
  return vm.runInNewContext(`${code}\nshowCoachButton`, { STORE_BUILD: storeBuild })
}

function viewFor(storeBuild, hash) {
  const state = loadHash(storeBuild)(hash)
  if (state.tab !== 'fitness') return state.tab
  return loadResolve(storeBuild)(state.subTab).tab
}

const alphaMail = { email: 'player-alpha@example.com', uid: 'someone-else' }
const ownerUid = { email: 'owner@example.com', uid: '59ole36uNpNwml5H6VDYCXyCME92' }

test('Store-Build: #inbox und #fitness/inbox öffnen die Inbox nicht', () => {
  assert.equal(viewFor(true, '#inbox'), 'hub')
  assert.equal(viewFor(true, '#fitness/inbox'), 'gate')
  assert.notEqual(viewFor(true, '#inbox'), 'inbox')
  assert.notEqual(viewFor(true, '#fitness/inbox'), 'inbox')
  assert.match(read('src/shell/FitnessApp.jsx'), /tab === 'inbox' && !STORE_BUILD && <Inbox/)
})

test('privater Build: #inbox und #fitness/inbox bleiben die Inbox', () => {
  assert.equal(viewFor(false, '#inbox'), 'inbox')
  assert.equal(viewFor(false, '#fitness/inbox'), 'inbox')
  assert.equal(loadResolve(false)('session').tab, 'session')
  assert.equal(viewFor(true, '#session'), 'session')
})

test('Store-Build: #coach und #fitness/coach öffnen den Coach nicht', () => {
  assert.equal(viewFor(true, '#coach'), 'hub')
  assert.equal(viewFor(true, '#fitness/coach'), 'gate')
  assert.notEqual(viewFor(true, '#coach'), 'coach')
  assert.notEqual(viewFor(true, '#fitness/coach'), 'coach')
  const nav = read('src/shell/NavigationItems.js')
  const expression = nav.match(/export const VALID_TABS = new Set\((.+)\)/)[1]
  const storeTabs = vm.runInNewContext(`new Set(${expression})`, {
    STORE_BUILD: true,
    NAV_ITEMS: [{ id: 'fitness' }, { id: 'settings' }],
  })
  const privateTabs = vm.runInNewContext(`new Set(${expression})`, {
    STORE_BUILD: false,
    NAV_ITEMS: [{ id: 'fitness' }, { id: 'settings' }],
  })
  assert.equal(storeTabs.has('coach'), false)
  assert.equal(privateTabs.has('coach'), true)
  assert.match(read('src/shell/ShellAppRouter.jsx'), /tab === 'coach' && !STORE_BUILD &&/)
  assert.match(read('src/shell/FitnessApp.jsx'), /tab === 'coach' && !STORE_BUILD && <Coach/)
})

test('privater Build: #coach und #fitness/coach bleiben erreichbar', () => {
  assert.equal(viewFor(false, '#coach'), 'coach')
  assert.equal(viewFor(false, '#fitness/coach'), 'coach')
})

test('Store-Build zeigt den Coach-Button nie, auch nicht bei Alpha-E-Mail', () => {
  const show = loadCoachButton(true)
  assert.equal(show(alphaMail, false), false)
  assert.equal(show(ownerUid, false), false)
  assert.equal(show(alphaMail, true), false)
  assert.equal(show(null, true), false)
  const sidebar = read('src/shell/layout/Sidebar.jsx')
  assert.doesNotMatch(sidebar, /includes\(['"]alpha['"]\)/)
  assert.doesNotMatch(sidebar, /email/)
  assert.match(sidebar, /showCoachButton\(user, isLocalMode\(\)\)/)
})

test('privater Build: Coach-Button nur bei Local-Mode oder der festen UID', () => {
  const show = loadCoachButton(false)
  assert.equal(show(alphaMail, false), false)
  assert.equal(show({ email: 'alpha-coach@example.com', uid: 'x' }, false), false)
  assert.equal(show(ownerUid, false), true)
  assert.equal(show({ email: 'local@localhost' }, true), true)
  assert.equal(show({ uid: 'other' }, false), false)
})
