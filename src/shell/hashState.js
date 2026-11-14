import { localISO } from './runtimeDate.js'

// Spiegelt NavigationItems.VALID_TABS, ohne dessen Vite-Aliase zu importieren
// (der Hash-Test läuft in Node). Neue Shell-Tabs hier und in NAV_ITEMS eintragen.
const SHELL_TABS = new Set([
  'hub', 'journal', 'home', 'fitness', 'sixpack', 'skills', 'fuel', 'relax',
  'habits', 'door', 'game', 'settings', 'coach',
])

// Hash-Routen der Shell. 6Pack und Skills hängen ihre interne Route an den
// Tab: #sixpack/<route> und #skills/<skillId>. Die Embeds schreiben den Hash
// nicht selbst; App.jsx spiegelt route über onRouteChange hierher.
//
// Altlinks bleiben lesbar: #timer, #fitness/timer, #fitness/skills und die
// Standalone-Form #skills?skill=<id> bzw. #?skill=<id>.

function localToday() {
  return localISO()
}

const DATE_LIKE = /^\d{4}-\d{2}-\d{2}$/
const FITNESS_DIRECT_ROUTES = new Set([
  'today', 'session', 'plan', 'history',
  'review', 'report', 'muscles', 'readiness', 'strength', 'verlauf',
  'learn', 'exercises', 'anatomy', 'quiz',
  'inbox',
])
const FUEL_DIRECT_ROUTES = new Set(['log', 'food', 'supplements', 'micros'])
const RELAX_DIRECT_ROUTES = new Set(['dash', 'ausbildung', 'atem', 'stats', 'physio', 'catalog'])
const FITNESS_DATE_ROUTES = new Set(['session'])

function resolveHashDate(value) {
  if (value === 'today') return localToday()
  if (!DATE_LIKE.test(value || '')) return null
  const date = new Date(`${value}T12:00:00`)
  return localISO(date) === value ? value : null
}

export function readHashState() {
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [pathPart = '', queryPart = ''] = raw.split('?')
  const skillFromQuery = new URLSearchParams(queryPart).get('skill')
  if (!pathPart) {
    if (skillFromQuery) return { tab: 'skills', subTab: skillFromQuery, date: null }
    return { tab: 'home', subTab: 'hub', date: null }
  }
  const segments = pathPart.split('/')
  const [mainTab = 'home', second = null, third = null] = segments
  const subTab = second && !DATE_LIKE.test(second) && second !== 'today' ? second : null
  const date = resolveHashDate(second) || resolveHashDate(third)

  // Legacy Fitness deep links for the extracted apps now open their own
  // top-level Shell routes.
  if (mainTab === 'timer' || (mainTab === 'fitness' && second === 'timer')) {
    return { tab: 'sixpack', subTab: null, date: null }
  }
  if (mainTab === 'fitness' && second === 'skills') {
    return { tab: 'skills', subTab: skillFromQuery || null, date: null }
  }
  if (['skills', 'sixpack', 'relax', 'journal', 'habits', 'plan', 'learn'].includes(mainTab) && ['settings', 'setup'].includes(second)) return { tab: 'settings', subTab: null, date: null }
  if (mainTab === 'sixpack') {
    const route = segments.slice(1).filter(Boolean).join('/')
    return { tab: 'sixpack', subTab: route || null, date: null }
  }
  if (mainTab === 'skills') {
    const route = segments.slice(1).filter(Boolean).join('/') || skillFromQuery
    return { tab: 'skills', subTab: route || null, date: null }
  }

  if (FITNESS_DIRECT_ROUTES.has(mainTab)) {
    return {
      tab: 'fitness',
      subTab: mainTab === 'session' && !second ? 'session' : mainTab,
      date: mainTab === 'session' || mainTab === 'today' ? (date || localToday()) : date,
    }
  }

  if (FUEL_DIRECT_ROUTES.has(mainTab)) {
    return { tab: 'fuel', subTab: mainTab, date: date || null }
  }

  if (RELAX_DIRECT_ROUTES.has(mainTab)) {
    return { tab: 'relax', subTab: mainTab, date: date || null }
  }

  if (mainTab === 'game' && second === 'door') return { tab: 'game', subTab: third ? `door/${third}` : 'door/potential', date: null }

  const fitnessSessionDate = mainTab === 'fitness' && subTab === 'session' ? (date || localToday()) : date
  if (mainTab === 'hub') return { tab: 'home', subTab: 'hub', date: null }
  if (mainTab === 'dashboard') return { tab: 'home', subTab: null }
  if (mainTab === 'learn') return { tab: 'fitness', subTab: 'learn' }
  if (mainTab === 'journal') return { tab: 'home', subTab: null, date: date || null }
  if (mainTab === 'fitness' && subTab === 'settings') return { tab: 'settings', subTab: null }
  if (mainTab === 'fuel' && subTab === 'journal') return { tab: 'home', subTab: null, date: date || null }
  if (mainTab === 'fuel' && subTab === 'habits') return { tab: 'habits', subTab: null }
  if (mainTab === 'fuel' && subTab === 'settings') return { tab: 'settings', subTab: null }
  return {
    tab: SHELL_TABS.has(mainTab) ? mainTab : 'hub',
    subTab: subTab || null,
    date: fitnessSessionDate || null,
  }
}

export function buildHashState({ tab, subTab = null, date = null }) {
  if (tab === 'sixpack') return subTab ? `#sixpack/${subTab}` : '#sixpack'
  if (tab === 'skills') return subTab ? `#skills/${subTab}` : '#skills'
  if (tab === 'fitness' && subTab) {
    const parts = [subTab]
    if (FITNESS_DATE_ROUTES.has(subTab) && date) parts.push(date)
    return `#${parts.join('/')}`
  }
  if (tab === 'fuel' && subTab) {
    const parts = [subTab]
    if (date) parts.push(date === localToday() ? 'today' : date)
    return `#${parts.join('/')}`
  }
  if (tab === 'relax' && subTab && RELAX_DIRECT_ROUTES.has(subTab)) {
    const parts = [subTab]
    if (date) parts.push(date)
    return `#${parts.join('/')}`
  }
  if (tab === 'home' && !subTab) {
    const parts = ['journal']
    if (date) parts.push(date)
    return `#${parts.join('/')}`
  }
  const parts = [tab]
  if (subTab) parts.push(subTab)
  if (date) parts.push(date)
  return `#${parts.join('/')}`
}
