import {
  Dumbbell, Flame, BookOpen, CheckSquare, Brain, Settings2,
  Activity, BarChart3, UtensilsCrossed, Pill, Microscope, ClipboardList, NotebookPen, MoonStar,
} from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'fitness',  label: 'Fitness', Icon: Dumbbell },
  { id: 'fuel',     label: 'Fuel',    Icon: Flame },
  { id: 'relax',    label: 'Relax',   Icon: MoonStar },
  { id: 'journal',  label: 'Journal', Icon: BookOpen },
  { id: 'habits',   label: 'Habits',  Icon: CheckSquare },
  { id: 'learn',    label: 'Lernen',  Icon: Brain },
  { id: 'settings', label: 'Setup',   Icon: Settings2 },
]

// 'coach' ist absichtlich nicht in NAV_ITEMS (eigener, bedingt sichtbarer
// Sidebar-Button außerhalb der Haupt-Nav-Schleife, siehe Sidebar.jsx) — muss
// aber trotzdem als gültiger Tab gelten, sonst verwirft navigate() den Klick.
export const VALID_TABS = new Set([...NAV_ITEMS.map(i => i.id), 'coach'])

export const SUB_NAV = {
  fitness: [
    { id: 'dash',    label: 'Heute',    Icon: Activity },
    { id: 'session', label: 'Training', Icon: Dumbbell },
    { id: 'review',  label: 'Review',   Icon: BarChart3 },
    { id: 'plan',    label: 'Plan',     Icon: ClipboardList },
  ],
  fuel: [
    { id: 'dashboard',   label: 'Dashboard', Icon: Flame },
    { id: 'food',        label: 'Food',      Icon: UtensilsCrossed },
    { id: 'journal',     label: 'Journal',   Icon: BookOpen },
    { id: 'habits',      label: 'Habits',    Icon: CheckSquare },
    { id: 'log',         label: 'Log',       Icon: NotebookPen },
    { id: 'supplements', label: 'Supps',     Icon: Pill },
    { id: 'micros',      label: 'Mikros',    Icon: Microscope },
  ],
}
