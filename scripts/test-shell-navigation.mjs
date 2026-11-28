import assert from 'node:assert/strict'
import { test } from 'node:test'
import { build } from 'esbuild'
import { createStore } from 'zustand/vanilla'

// Run the real wrapper effects with deterministic hook scheduling and stub views.
async function component(file) {
  const result = await build({
    entryPoints: [new URL(`../src/shell/${file}`, import.meta.url).pathname],
    bundle: true, write: false, format: 'esm', jsxFactory: 'element',
    banner: { js: 'const element = (type, props, ...children) => ({ type, props: { ...props, children } });' },
    plugins: [{ name: 'wrapper-fixtures', setup(b) {
      b.onResolve({ filter: /.*/ }, args => args.kind === 'entry-point' ? null : { path: args.path, namespace: 'fixture' })
      b.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => {
        if (path === 'react') return { contents: ['useEffect', 'useRef', 'useState', 'useMemo'].map(name => `export const ${name} = (...args) => globalThis.__wrapperHooks.${name}(...args);`).join('\n') }
        if (path === '@fuel/store.js') return { contents: 'export const useApp = selector => selector(globalThis.__wrapperStore.getState()); useApp.getState = () => globalThis.__wrapperStore.getState();' }
        if (path === '@db') return { contents: `export const getSession = date => { globalThis.__sessionReads.push(date); return Promise.resolve({exercises:[]}) }; export const getSessionHistory=async()=>[], saveSession=async(date,data)=>{globalThis.__sessionWrites.push({date,data})}, searchExercises=async()=>({results:[]}), getExercise=async()=>({});` }
        if (path.endsWith('PulseFeed.jsx')) return { contents: 'export default function Feed() {} export function PulseHeader() {}' }
        if (path.endsWith('parseLog.js')) return { contents: 'export const parseLogText=name=>({name,sets:[]}), slugify=value=>value;' }
        if (path === 'lucide-react') return { contents: 'export const Activity=()=>null, MoonStar=Activity, BookOpen=Activity, BarChart3=Activity, Zap=Activity, Beaker=Activity, Wind=Activity, GraduationCap=Activity;' }
        return { contents: 'export default function View() {}' }
      })
    } }],
  })
  return (await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)).default
}

function renderer(Component, props) {
  const slots = []
  let cursor, effects, changed, tree
  const hooks = {
    useMemo(compute) { return compute() },
    useRef(value) { const i=cursor++; return slots[i] ||= { current:value } },
    useState(value) {
      const i=cursor++
      if (!(i in slots)) slots[i]=value
      return [slots[i], next => { if (!Object.is(slots[i], next)) { slots[i]=next; changed=true } }]
    },
    useEffect(effect, deps) {
      const i=cursor++
      if (!slots[i] || deps.some((value,n) => !Object.is(value,slots[i][n]))) effects.push(effect)
      slots[i]=deps
    },
  }
  return () => {
    for (let i=0;i<12;i++) {
      cursor=0;effects=[];changed=false
      globalThis.__wrapperHooks=hooks
      tree=Component(props)
      for (const effect of effects) effect()
      if (!changed) return tree
    }
    throw new Error('navigation did not settle')
  }
}

function findNavigation(tree) {
  if (!tree || typeof tree !== 'object') return null
  if (tree.props?.onNavigate) return tree.props.onNavigate
  for (const child of tree.props?.children || []) {
    const found = findNavigation(child)
    if (found) return found
  }
  return null
}

test('Fuel internal navigation reaches the Shell and Shell changes reach Fuel', async () => {
  const Component=await component('FuelWrapper.jsx')
  const store=createStore(set => ({activeTab:'food',setActiveTab:activeTab=>set({activeTab})}))
  globalThis.__wrapperStore=store
  const props={user:{uid:'A'},subTab:'food',onSubTab:tab=>{props.subTab=tab},onNavigateShell() {}}
  const render=renderer(Component,props)
  render()
  store.getState().setActiveTab('pots')
  render();render()
  assert.equal(props.subTab,'pots')
  assert.equal(store.getState().activeTab,'pots')
  props.subTab='supplements'
  render();render()
  assert.equal(store.getState().activeTab,'supplements')
})

test('Relax internal navigation reaches the Shell and Shell changes reach Relax', async () => {
  const Component=await component('RelaxApp.jsx')
  const props={subTab:'dash',onSubTab:tab=>{props.subTab=tab}}
  const render=renderer(Component,props)
  findNavigation(render())('atem')
  render();let tree=render()
  assert.equal(props.subTab,'atem')
  props.subTab='ausbildung'
  tree=render();render()
  findNavigation(tree)('session')
  render();render()
  assert.equal(props.subTab,'session')
})

test('embedded Pulse loads and labels the selected Shell day', async () => {
  const Pulse=await component('../../vos-fitness/src/pulse/PulseLog.jsx')
  globalThis.__sessionReads=[]
  globalThis.__sessionWrites=[]
  const render=renderer(Pulse,{user:{uid:'A'},date:'2026-11-27',embedded:true})
  const tree=render()
  assert.deepEqual(globalThis.__sessionReads,['2026-11-27'])
  assert.equal(tree.props.children[0].props.date,'2026-11-27')
  await tree.props.children[1].props.onLog('Squat')
  assert.equal(globalThis.__sessionWrites[0].date,'2026-11-27')
  assert.equal(globalThis.__sessionWrites[0].data.date,'2026-11-27')
})

test('standalone Pulse keeps using today when no date is supplied', async () => {
  const { localISO } = await import('../src/shell/runtimeDate.js')
  const Pulse=await component('../../vos-fitness/src/pulse/PulseLog.jsx')
  globalThis.__sessionReads=[]
  renderer(Pulse,{user:{uid:'A'}})()
  assert.deepEqual(globalThis.__sessionReads,[localISO()])
})
