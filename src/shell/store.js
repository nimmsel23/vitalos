import { createSettingsStore, ls, lsInt, lsFloat } from '@fitness/src/store/settingsStore.js'
import { localISO } from './runtimeDate.js'

/**
 * Shell-Settings-Store (Zustand) — SSOT für alle vitalos-weiten User-Settings.
 *
 * Nutzt dieselbe createSettingsStore()-Fabrik wie fitness-app (@fitness/src/
 * store/settingsStore.js), damit die geteilten UI-Settings (Theme, Layout-
 * Scale, Sidebar-Pin, ...) nicht länger als zwei unabhängig gepflegte
 * Implementierungen (Context+useState in fitness-app vs. Zustand hier)
 * auseinanderlaufen. Persistiert weiterhin auf den historischen `vitalos-*`
 * Einzel-Keys (fitness-app nutzt eigene `fitness-*` Keys, beide Origins sind
 * ohnehin getrennte localStorage-Buckets) statt auf einen persist-Middleware-
 * Blob, damit bestehende Werte der User erhalten bleiben.
 *
 * Vitalos-eigene Profil-/Domain-Felder (gender, age, split, ...), die es in
 * fitness-apps Settings-Store nicht gibt, werden per extraFields in denselben
 * Store gemischt statt einen zweiten Hook zu pflegen.
 */

const EXTRA_FIELDS = {
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
  runtimeDate:          ['vitalos-runtimeDate',          () => ls('vitalos-runtimeDate', localISO())],
  mobileLayout:         ['vitalos-mobileLayout',         () => ls('vitalos-mobileLayout', 'classic')],
}

export const useShellSettings = createSettingsStore('vitalos', EXTRA_FIELDS)
