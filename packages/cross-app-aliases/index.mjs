import { existsSync } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VITALOS_ROOT = `${__dirname}/../..`

// Sub-Repos heißen als vitalos-Submodule "*-app" (fitness-app, fuel-app, ...),
// als eigenständiger Home-Checkout aber "*-dev" (fitness-dev, fuel-dev, ...).
// Auch unter VITALOS_ROOT kann ein Ordner per lokalem Symlink/Dev-Branch-Setup
// auf den -dev-Namen zeigen statt auf -app — erster existierender Kandidat
// gewinnt, damit die anderen vite.configs (die dieses Package nutzen) nicht
// brechen, nur weil bei jemandem lokal die -dev-Variante nested liegt.
function appDir(nameApp, nameDev) {
  const appPath = `${VITALOS_ROOT}/${nameApp}`
  return existsSync(appPath) ? appPath : `${VITALOS_ROOT}/${nameDev}`
}

const FITNESS = appDir('fitness-app', 'fitness-dev')
const FUEL    = appDir('fuel-app', 'fuel-dev')
const JOURNAL = appDir('journal-app', 'journal-dev')
const HABITS  = appDir('habit-app', 'habits-dev')
const LEARN   = appDir('learn-dev', 'learn-dev')
const RELAX   = appDir('relax-app', 'relax-dev')

// SSOT für alle Cross-App-Aliase (Sub-Repo A importiert Code aus Sub-Repo B).
// Wird als npm-Workspace-Package in ~/vitalos symlinked — nur erreichbar,
// wenn der aufrufende vite.config.js unter vitalos genestet ist (Submodule
// oder Meta-Repo-Checkout in der CI). Standalone-Checkouts (~/fitness-dev
// ohne vitalos-Parent) sehen dieses Package gar nicht und fallen in ihrem
// eigenen vite.config.js auf die alte siblingDir()/resolveSibling()-Logik
// zurück.
export function crossAppAliases() {
  // Reihenfolge ist bewusst: Vite matched Alias-Keys per startsWith()+Slash-
  // Grenze in Objekt-Reihenfolge — das erste treffende Match gewinnt. Ein
  // zusammengesetzter Key wie '@fitness/components' matcht auch gegen den
  // kürzeren Key '@fitness' (Slash-Grenze erfüllt), deshalb müssen alle
  // spezifischeren '@x/y'- und '@x-db'-artigen Keys VOR dem kurzen '@x'-Key
  // stehen, sonst gewinnt der falsche (kürzere) Alias.
  return {
    '@fitness/components': `${FITNESS}/src/components`,
    '@fitness/constants':  `${FITNESS}/src/constants`,
    '@fitness-db':         `${FITNESS}/src/lib/db`,
    '@fitness':            FITNESS,
    '@fuel-db':            `${FUEL}/src/client/lib/db`,
    '@fuel-views':         `${FUEL}/src/client/views`,
    '@fuel':               `${FUEL}/src/client`,
    '@journal-db':         `${JOURNAL}/src/db/index.js`,
    '@journal':            `${JOURNAL}/src`,
    '@habits-db':          `${HABITS}/src/db`,
    '@habits':             `${HABITS}/src`,
    '@relax-db':           `${RELAX}/src/lib/db`,
    '@relax':              `${RELAX}/src`,
    '@learn':              `${LEARN}/src`,
  }
}
