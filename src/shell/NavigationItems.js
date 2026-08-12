import {
  Dumbbell, Flame, CheckSquare, Brain, Settings2,
  Home, LayoutDashboard, BarChart3, UtensilsCrossed, Pill, Microscope, NotebookPen, MoonStar, Bell, Shield,
  Layers, Zap, History, CalendarDays,
} from 'lucide-react'
import { NAV_ITEMS as FITNESS_NAV_ITEMS } from '@constants/NavigationItems.js'

export const NAV_ITEMS = [
  { id: 'home',     label: 'Home',    Icon: LayoutDashboard },
  { id: 'fitness',  label: 'Fitness', Icon: Dumbbell },
  { id: 'fuel',     label: 'Fuel',    Icon: Flame },
  { id: 'journal',  label: 'Journal', Icon: NotebookPen },
  { id: 'relax',    label: 'Relax',   Icon: MoonStar },
  { id: 'habits',   label: 'Habits',  Icon: CheckSquare },
  { id: 'settings', label: 'Setup',   Icon: Settings2 },
]

// 'coach' ist absichtlich nicht in NAV_ITEMS (eigener, bedingt sichtbarer
// Sidebar-Button außerhalb der Haupt-Nav-Schleife, siehe Sidebar.jsx) — muss
// aber trotzdem als gültiger Tab gelten, sonst verwirft navigate() den Klick.
export const VALID_TABS = new Set(['hub', ...NAV_ITEMS.map(i => i.id), 'coach'])

// Sidebar/Subnav ist bewusst NICHT identisch zum Fitness-Gate.
// Das Gate ist die reduzierte Card-Einstiegsfläche; die Desktop-Sidebar bleibt
// eine eigene Navigationsschicht und wird separat gepflegt.
// Struktur bewusst identisch zu fitness-apps eigener NAV_ITEMS (@fitness/src/
// constants/NavigationItems.js) — 'review' hat dieselben verschachtelten
// Nebenansichten (Muskeln/Readiness/Verlauf), 'Bericht' selbst ist keine davon
// (noDefaultSub: true, siehe dortiger Kommentar) sondern der Review-Tab selbst.
const FITNESS_SIDEBAR_NAV = [
  { id: 'session', label: 'Training', Icon: Dumbbell },
  { id: 'review',  label: 'Review',   Icon: BarChart3, noDefaultSub: true, sub: [
    { id: 'readiness', label: 'Readiness', Icon: Zap },
    { id: 'muscles',   label: 'Muskeln',   Icon: Layers },
    { id: 'verlauf',   label: 'Verlauf',   Icon: History },
  ]},
  { id: 'learn',   label: 'Learn',    Icon: Brain },
]

// Log zuerst — die tägliche Kernaktion (analog zu Training bei Fitness),
// Food/Supps/Mikros sind Nachschlagewerke, die man seltener direkt ansteuert.
export const SUB_NAV = {
  fitness: FITNESS_SIDEBAR_NAV,
  fuel: [
    { id: 'log',         label: 'Log',       Icon: NotebookPen },
    { id: 'food',        label: 'Food',      Icon: UtensilsCrossed },
    { id: 'supplements', label: 'Supps',     Icon: Pill },
    { id: 'micros',      label: 'Mikros',    Icon: Microscope },
  ],
  relax: [
    { id: 'dash',    label: 'Heute',   Icon: Home },
    { id: 'session', label: 'Session', Icon: MoonStar },
    { id: 'journal', label: 'Journal', Icon: NotebookPen },
    { id: 'stats',   label: 'Stats',   Icon: BarChart3 },
    { id: 'physio',  label: 'Physio',  Icon: Zap },
    { id: 'catalog', label: 'Catalog', Icon: Microscope },
  ],
}

// Gruppierte Karten fürs Fitness-AppGate (App.jsx HomeFitnessGate +
// FitnessApp.jsx eigenes Gate) — SSOT statt zweimal dieselbe flatMap-Logik.
// Flach + ungruppiert (Stand vor 2026-08-06) war der Grund für "man kennt
// sich nicht aus": 9 Karten aus Training/Review/Learn ohne erkennbare
// Zugehörigkeit. Jetzt in Gruppen mit Section-Label, Reihenfolge folgt dem
// Workflow (jetzt trainieren -> danach auswerten -> zum Nachschlagen lernen).
export function buildFitnessGateItems() {
  const session = FITNESS_NAV_ITEMS.find((item) => item.id === 'session')
  const review  = FITNESS_NAV_ITEMS.find((item) => item.id === 'review')
  const learn   = FITNESS_NAV_ITEMS.find((item) => item.id === 'learn')

  return [
    {
      group: 'Training',
      items: (session?.sub ?? []).map((item) => (
        item.id === 'today' ? { ...item, label: 'Heute', Icon: CalendarDays } : { ...item }
      )),
    },
    {
      group: 'Review',
      items: [
        { id: 'report', label: 'Bericht', Icon: review?.Icon ?? BarChart3 },
        ...(review?.sub ?? []),
      ],
    },
    {
      group: 'Lernen',
      items: learn?.sub ?? [],
    },
  ]
}
