import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'

const root = resolve(import.meta.dirname, '..')
const sources = [
  ['vitalos', root],
  ['fitness', process.argv[2] || resolve(root, 'fitness-app')],
  ['journal', process.argv[3] || resolve(root, 'journal-app')],
]
const ids = []
for (const [app, dir] of sources) {
  const code = readFileSync(resolve(dir, 'functions/index.js'), 'utf8')
  const config = JSON.parse(readFileSync(resolve(dir, 'firebase.json'), 'utf8'))
  assert.equal(config.functions.codebase, app, `${app}: codebase owns its functions`)
  const exports = {}
  let sends = 0
  const errors = []
  const settings = { apps: Object.fromEntries(['journal', 'fitness', 'vitalos'].map((id) => [id, { enabled: id !== app, tokens: ['foreign-app-token'] }])) }
  const user = {
    id: 'test-user',
    collection: (collection) => {
      assert.equal(collection, 'settings')
      return { doc: (id) => {
        assert.equal(id, 'push')
        return { get: async () => ({ exists: true, data: () => settings }) }
      } }
    },
  }
  const firestore = {
    collection: (name) => {
      assert.equal(name, 'fitness')
      return { listDocuments: async () => [user] }
    },
    collectionGroup: (name) => {
      assert.equal(name, 'settings')
      return { where: (field, op, value) => {
        assert.equal(field, `apps.${app}.enabled`)
        assert.equal(op, '==')
        assert.equal(value, true)
        return { get: async () => ({ empty: true, docs: [] }) }
      } }
    },
  }
  const chain = (region) => {
    const value = {
      pubsub: { schedule: (schedule) => ({ timeZone: (timeZone) => ({ onRun: (handler) => ({ region, schedule, timeZone, handler }) }) }) },
      firestore: { document: () => ({ onCreate: () => ({}), onWrite: () => ({}) }) },
      https: { onCall: () => ({}), onRequest: () => ({}) },
    }
    return value
  }
  const helpers = new Proxy({}, { get: (_, key) => key === 'REGION' ? 'europe-west1' : () => {} })
  vm.runInNewContext(code, {
    exports, console: { log() {}, error: (...args) => errors.push(args) }, process: { env: {} }, __dirname: resolve(dir, 'functions'),
    require: (name) => name === 'firebase-functions' ? { region: chain, logger: { info() {} } }
      : name === 'firebase-admin' ? { initializeApp() {}, firestore: () => firestore, messaging: () => ({ sendEachForMulticast() { sends++; return {} } }) } : helpers,
  }, { filename: `${app}/functions/index.js` })
  assert.equal(exports.scheduledPushReminders, undefined, `${app}: no shared legacy export`)
  const matches = Object.entries(exports).filter(([name]) => name.toLowerCase().includes(`${app}pushreminders`))
  assert.equal(matches.length, 1, `${app}: exactly one app-specific reminder`)
  const [id, schedule] = matches[0]
  assert.equal(schedule.region, 'europe-west1')
  assert.equal(schedule.schedule, 'every 5 minutes')
  assert.equal(typeof schedule.handler, 'function')
  assert.ok(new RegExp(`apps\\??\\.${app}`).test(code), `${app}: settings lane`)
  assert.match(code, new RegExp(`app: "${app}"`), `${app}: notification lane`)
  await schedule.handler()
  assert.equal(sends, 0, `${app}: other enabled app lanes cannot trigger a push`)
  assert.deepEqual(errors, [], `${app}: handler reads the real settings shape without errors`)
  ids.push(id)
}
assert.equal(new Set(ids).size, 3, 'All three live function identities are distinct')
const config = JSON.parse(readFileSync(resolve(root, 'firebase.push.json'), 'utf8'))
assert.deepEqual(config.functions.map((entry) => entry.codebase).sort(), ['fitness', 'journal', 'vitalos'])
console.log('Push isolation passed: unique exports/codebases, independent schedules, settings and payload lanes; no messages sent.')
