import {
  Dumbbell, Flame, BookOpen, CheckSquare, Brain, Settings2,
  Home, LayoutDashboard, BarChart3, UtensilsCrossed, Pill, Microscope, NotebookPen, MoonStar, Bell, Shield,
} from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'hub',      label: 'Hub',     Icon: Home },
  { id: 'dashboard', label: 'Heute',  Icon: LayoutDashboard },
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
    { id: 'session', label: 'Training', Icon: Dumbbell },
    { id: 'review',  label: 'Review',   Icon: BarChart3 },
    { id: 'learn',   label: 'Lernen',   Icon: Brain },
    { id: 'inbox',   label: 'Inbox',    Icon: Bell },
    { id: 'coach',   label: 'Coach',    Icon: Shield },
    { id: 'settings', label: 'Setup',   Icon: Settings2 },
  ],
  fuel: [
    { id: 'food',        label: 'Food',      Icon: UtensilsCrossed },
    { id: 'log',         label: 'Log',       Icon: NotebookPen },
    { id: 'supplements', label: 'Supps',     Icon: Pill },
    { id: 'micros',      label: 'Mikros',    Icon: Microscope },
  ],
}
