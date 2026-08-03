import { create } from 'zustand'

/**
 * Shell-Settings-Store (Zustand) — SSOT für alle vitalos-weiten User-Settings.
 *
 * Persistiert bewusst auf die historischen Einzel-Keys (`vitalos-*`) statt auf
 * einen persist-Middleware-Blob, damit bestehende Werte der User erhalten
 * bleiben und andere Konsumenten der Keys weiter funktionieren.
 */

const ls = (key, fallback) => {
  const v = localStorage.getItem(key)
  return v === null ? fallback : v
}
const lsInt = (key, fallback) => parseInt(ls(key, String(fallback)), 10)
const lsFloat = (key, fallback) => parseFloat(ls(key, String(fallback)))

// key im Store → [localStorage-Key, Initialwert]
const FIELDS = {
  theme:                ['vitalos-theme',                () => ls('vitalos-theme', 'nordic')],
  themeMode:            ['vitalos-theme-mode',           () => ls('vitalos-theme-mode', 'manual')],
  circDark:             ['vitalos-circ-dark',            () => ls('vitalos-circ-dark', 'nordic')],
  circLight:            ['vitalos-circ-light',           () => ls('vitalos-circ-light', 'honey')],
  gender:               ['vitalos-gender',               () => ls('vitalos-gender', 'm')],
  // Anatomie-Modell (BodyMap-Visualisierung, 'male'/'female') — bewusst getrennt
  // vom Profil-Geschlecht ('m'/'f'): ein gemeinsames Feld machte beide Settings
  // zum Entweder-oder, da die Wertemengen inkompatibel sind.
  anatomyModel:         ['vitalos-anatomy-model',        () => ls('vitalos-anatomy-model', ls('vitalos-gender', 'm') === 'f' ? 'female' : 'male')],
  age:                  ['vitalos-age',                  () => lsInt('vitalos-age', 30)],
  heightCm:             ['vitalos-height',               () => lsInt('vitalos-height', 175)],
  weightKg:             ['vitalos-weight',               () => lsFloat('vitalos-weight', 80)],
  split:                ['vitalos-split',                () => ls('vitalos-split', 'PPL')],
  cycleLength:          ['vitalos-cycleLength',          () => lsInt('vitalos-cycleLength', 4)],
  defaultLocation:      ['vitalos-defaultLocation',      () => ls('vitalos-defaultLocation', 'Home')],
  layoutScale:          ['vitalos-layoutScale',          () => lsInt('vitalos-layoutScale', 100)],
  recentDays:           ['vitalos-recentDays',           () => lsInt('vitalos-recentDays', 7)],
  coverageThreshold:    ['vitalos-coverageThreshold',    () => lsFloat('vitalos-coverageThreshold', 1.0)],
  showAdvanced:         ['vitalos-showAdvanced',         () => ls('vitalos-showAdvanced', 'false') === 'true'],
  dashboardHighlighter: ['vitalos-dashboardHighlighter', () => ls('vitalos-dashboardHighlighter', 'body')],
  sidebarPinned:        ['vitalos-sidebarPinned',        () => ls('vitalos-sidebarPinned', 'true') !== 'false'],
  muscleLanguage:       ['vitalos-muscleLanguage',       () => ls('vitalos-muscleLanguage', 'de')],
  swipeEnabled:         ['vitalos-swipeEnabled',         () => ls('vitalos-swipeEnabled', 'false') === 'true'],
  mobileLayout:         ['vitalos-mobileLayout',         () => ls('vitalos-mobileLayout', 'classic')],
}

export const useShellSettings = create((set) => {
  const state = {}
  for (const [key, [lsKey, init]] of Object.entries(FIELDS)) {
    state[key] = init()
    const setterName = 'set' + key[0].toUpperCase() + key.slice(1)
    state[setterName] = (value) => {
      localStorage.setItem(lsKey, value)
      set({ [key]: value })
    }
  }
  return state
})

// Setter-Aliase für Komponenten, die historische Namen erwarten
useShellSettings.setState({
  setThemeState: useShellSettings.getState().setTheme,
  setModeState:  useShellSettings.getState().setThemeMode,
})
