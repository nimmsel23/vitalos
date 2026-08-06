import {
  Dumbbell, Flame, CheckSquare, Brain, Settings2,
  Home, LayoutDashboard, BarChart3, UtensilsCrossed, Pill, Microscope, NotebookPen, MoonStar, Bell, Shield,
  Layers, Zap, History,
} from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'hub',      label: 'Hub',     Icon: Home },
  { id: 'home',     label: 'Home',    Icon: LayoutDashboard },
  { id: 'fitness',  label: 'Fitness', Icon: Dumbbell },
  { id: 'fuel',     label: 'Fuel',    Icon: Flame },
  { id: 'relax',    label: 'Relax',   Icon: MoonStar },
  { id: 'habits',   label: 'Habits',  Icon: CheckSquare },
  { id: 'settings', label: 'Setup',   Icon: Settings2 },
]

// 'coach' ist absichtlich nicht in NAV_ITEMS (eigener, bedingt sichtbarer
// Sidebar-Button außerhalb der Haupt-Nav-Schleife, siehe Sidebar.jsx) — muss
// aber trotzdem als gültiger Tab gelten, sonst verwirft navigate() den Klick.
export const VALID_TABS = new Set([...NAV_ITEMS.map(i => i.id), 'coach'])

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
    { id: 'muscles',   label: 'Muskeln',   Icon: Layers },
    { id: 'readiness', label: 'Readiness', Icon: Zap },
    { id: 'verlauf',   label: 'Verlauf',   Icon: History },
  ]},
  { id: 'learn',   label: 'Learn',    Icon: Brain },
]

export const SUB_NAV = {
  fitness: FITNESS_SIDEBAR_NAV,
  fuel: [
    { id: 'food',        label: 'Food',      Icon: UtensilsCrossed },
    { id: 'log',         label: 'Log',       Icon: NotebookPen },
    { id: 'supplements', label: 'Supps',     Icon: Pill },
    { id: 'micros',      label: 'Mikros',    Icon: Microscope },
  ],
}
