import {
  Dumbbell, Flame, CheckSquare, Settings2,
  Home, UtensilsCrossed, Pill, Microscope, NotebookPen, MoonStar, Shield,
  BarChart3, Zap, DoorOpen, Hammer, LayoutGrid, Trophy, Compass, Target, Landmark, Mic,
  CalendarDays, Camera, GitCommitVertical, CookingPot, Refrigerator, MessageSquareText, Grid3x3,
} from 'lucide-react'
import { NAV_ITEMS as FITNESS_NAV_ITEMS } from '@constants/NavigationItems.js'

// Hash-Routen der Door-/Game-Tabs: #door/<potential|plan|production|profit> (Door v1),
// #game/<fire|focus|freedom|frame|voice> und #game/door/<phase> (Door v2). Rechtsklick/Long-Press
// auf Door oder Game öffnet die Direktwahl (SUB_NAV.door / SUB_NAV.game, flattenMenuItems).
export const NAV_ITEMS = [
  { id: 'home',     label: 'Journal', Icon: NotebookPen },
  { id: 'fitness',  label: 'Fitness', Icon: Dumbbell, standaloneUrl: 'https://fitness-vos.web.app' },
  { id: 'sixpack',  label: '6Pack',   Icon: Zap },
  { id: 'skills',   label: 'Skills',  Icon: Trophy, standaloneUrl: 'https://vos-skills.web.app' },
  { id: 'fuel',     label: 'Fuel',    Icon: Flame, standaloneUrl: 'https://fuel-vos.web.app' },
  { id: 'relax',    label: 'Relax',   Icon: MoonStar, standaloneUrl: 'https://relax-vos.web.app' },
  { id: 'habits',   label: 'Habits',  Icon: CheckSquare },
  { id: 'door',     label: 'Door',    Icon: DoorOpen },
  { id: 'game',     label: 'Game',    Icon: Compass },
  { id: 'settings', label: 'Setup',   Icon: Settings2 },
]

// 'coach' ist absichtlich nicht in NAV_ITEMS (eigener, bedingt sichtbarer
// Sidebar-Button außerhalb der Haupt-Nav-Schleife, siehe Sidebar.jsx) — muss
// aber trotzdem als gültiger Tab gelten, sonst verwirft navigate() den Klick.
export const VALID_TABS = new Set(['hub', 'journal', ...NAV_ITEMS.map(i => i.id), 'coach'])

// Die Shell nutzt dieselbe Fitness-Subnav-Struktur wie fitness-app selbst,
// damit neue Untertabs nicht erneut manuell nachgezogen werden muessen.
const FITNESS_SIDEBAR_NAV = FITNESS_NAV_ITEMS
  .filter(({ id }) => id === 'session' || id === 'review' || id === 'learn')
  .map((item) => ({
    ...item,
    hideInFlatNav: item.id === 'session',
  }))

// Log zuerst — die tägliche Kernaktion (analog zu Training bei Fitness),
// Food/Supps/Mikros sind Nachschlagewerke, die man seltener direkt ansteuert.
export const SUB_NAV = {
  fitness: [{ id: 'pulse', label: 'Pulse', Icon: Zap }, ...FITNESS_SIDEBAR_NAV],
  fuel: [
    { id: 'log',           label: 'Log',           Icon: NotebookPen },
    // Schnelleinstiege (fuel-app Frontdoors) und Log-Ansichten als eigene Untertabs;
    // tapboard/shutter/tagesfaden rendert ShellAppRouter über FuelFrontdoors.jsx.
    { id: 'tapboard',      label: 'Tap Board',     Icon: Grid3x3 },
    { id: 'shutter',       label: 'Shutter',       Icon: Camera },
    { id: 'tagesfaden',    label: 'Tagesfaden',    Icon: MessageSquareText },
    { id: 'log-dashboard', label: 'Log-Dashboard', Icon: LayoutGrid },
    { id: 'log-timeline',  label: 'Timeline',      Icon: GitCommitVertical },
    { id: 'food',          label: 'Food',          Icon: UtensilsCrossed },
    { id: 'pots',          label: 'Töpfe',         Icon: CookingPot },
    { id: 'kitchen',       label: 'Küche',         Icon: Refrigerator },
    { id: 'supplements',   label: 'Supps',         Icon: Pill },
    { id: 'micros',        label: 'Mikros',        Icon: Microscope },
  ],
  // Die 4 P's des Door-Frameworks (Door v1: journal-app/src/views/door/DoorView.jsx)
  door: [
    { id: 'potential',  label: 'Potential',  Icon: Flame },
    { id: 'plan',       label: 'Plan',       Icon: LayoutGrid },
    { id: 'production', label: 'Production', Icon: Hammer },
    { id: 'profit',     label: 'Profit',     Icon: Trophy },
  ],
  // Game-Maps (journal-app/src/views/game/GameV2View.jsx)
  game: [
    { id: 'fire',    label: 'Fire',    Icon: Flame },
    { id: 'focus',   label: 'Focus',   Icon: Target },
    { id: 'freedom', label: 'Freedom', Icon: Landmark },
    { id: 'frame',   label: 'Frame',   Icon: LayoutGrid },
    { id: 'voice',   label: 'Voice',   Icon: Mic },
    // Door v2 (journal-app/src/views/door/v2/DoorV2View.jsx) als Gruppe unter Game: #game/door/<phase>
    { id: 'door', label: 'Door', Icon: DoorOpen, noDefaultSub: true, sub: [
      { id: 'door/potential',  label: 'Potential',  Icon: Flame },
      { id: 'door/plan',       label: 'Plan',       Icon: LayoutGrid },
      { id: 'door/production', label: 'Production', Icon: Hammer },
      { id: 'door/profit',     label: 'Profit',     Icon: Trophy },
    ] },
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
      group: 'Pulse',
      items: [{ id: 'pulse', label: 'Pulse', Icon: Zap }],
    },
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

// Flache Menüliste für Kontextmenüs: Gruppen mit `sub` werden zu "Gruppe · Eintrag".
export function flattenMenuItems(items = []) {
  return items.flatMap((item) => (item.sub?.length
    ? item.sub.map((child) => ({ id: child.id, label: `${item.label} · ${child.label}` }))
    : [{ id: item.id, label: item.label }]))
}
