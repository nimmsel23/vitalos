import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from 'tailwindcss'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname    = dirname(fileURLToPath(import.meta.url))  // ~/vitalos/
const VITALOS_SRC  = resolve(__dirname, 'src')
const FITNESS_DEV  = resolve(__dirname, 'fitness-dev')
const FITNESS_SRC  = resolve(FITNESS_DEV, 'src')
const FUEL_ROOT    = resolve(__dirname, 'fuel-dev')
const JOURNAL_DEV  = resolve(__dirname, 'journal-dev')
const HABITS_DEV   = resolve(__dirname, 'habits-dev')
const LEARN_DEV    = resolve(__dirname, 'learn-dev')
const RELAX_DEV    = resolve(__dirname, 'relax-dev')
const RELAX_BACKEND = 'http://localhost:9123'
const BACKEND      = 'http://localhost:9100'

// journalDbPlugin wurde entfernt (2026-07-05): sollte @db für journal-dev/
// habits-dev-Importer kontextabhängig umleiten, feuerte aber nie — Vites
// core Alias-Resolution (resolve.alias['@db']) läuft mit höherer Priorität
// und löst '@db' auf, bevor normale Plugin-resolveId-Hooks es sehen
// (empirisch verifiziert: resolveId wurde für keinen einzigen @db-Import
// aus JournalVosView.jsx aufgerufen). Der bestehende Fallback — '@db' →
// coach/db.js (lokal) bzw. cloud/db.firestore.js (firebase), beide re-
// exportieren/implementieren journal+habits+sessions+meals vollständig —
// hat die ganze Zeit funktioniert und liefert sogar bessere Daten als das
// tote Plugin (echte fitness-dev-Sessions statt journal-devs Stubs).

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'

  const aliases = {
    '@src':        VITALOS_SRC,
    '@shell':      resolve(VITALOS_SRC, 'shell'),
    '@coach':      resolve(VITALOS_SRC, 'coach'),
    '@cloud':      resolve(VITALOS_SRC, 'cloud'),
    '@components': resolve(FITNESS_SRC, 'components'),
    '@lib':        resolve(FITNESS_SRC, 'lib'),
    '@constants':  resolve(FITNESS_SRC, 'constants'),
    '@utils':      resolve(FITNESS_SRC, 'lib/utils.js'),
    '@db':         resolve(VITALOS_SRC, isFirebase ? 'shell/db/index.js' : 'coach/db.js'),
    '@fitness-db': resolve(FITNESS_SRC, 'lib/db'),
    '@habits':              resolve(HABITS_DEV, 'src'),
    '@journal':             resolve(JOURNAL_DEV, 'src'),
    '@learn':               resolve(LEARN_DEV, 'src'),
    '@relax':               resolve(RELAX_DEV, 'src'),
    '@fitness/components':  resolve(FITNESS_SRC, 'components'),
    '@fitness/constants':   resolve(FITNESS_SRC, 'constants'),
    '@fitness':             FITNESS_DEV,

    // ── Tab Sources (eine Zeile = ein Tab, Herkunft sofort sichtbar) ───────────
    '@view/dashboard':  resolve(VITALOS_SRC,         'shell/Dashboard.jsx'),  // vitalos-spezifisch
    '@view/session':    resolve(FITNESS_SRC,          'views/Session'),        // fitness-dev
    '@view/review':     resolve(FITNESS_SRC,          'views/WeeklyReview'),   // fitness-dev
    '@view/muscles':    resolve(FITNESS_SRC,          'views/Muscles'),        // fitness-dev
    '@view/learn':      resolve(LEARN_DEV,            'src/views/Learn'),      // learn-dev
    '@view/journal':    resolve(JOURNAL_DEV,          'src/views/JournalVosView.jsx'), // journal-dev
    '@view/habits':     resolve(HABITS_DEV,           'src/views/Habits'),     // habits-dev
    '@view/settings':   resolve(VITALOS_SRC,          'shell/Settings'),       // vitalos-spezifisch
    '@view/plan':       resolve(FITNESS_SRC,          'views/Plan'),           // fitness-dev
    '@view/coach':      resolve(FITNESS_SRC,          'views/Coach'),          // fitness-dev

    '@firebase-config': resolve(__dirname, 'firebase.config.js'),

    'fuel/FuelApp':     resolve(VITALOS_SRC, 'shell/FuelApp.jsx'),
    '@fuel':            resolve(FUEL_ROOT, 'src/client'),
    '@fuel-shared':     resolve(FUEL_ROOT, 'src/shared'),
    '@api':             resolve(FUEL_ROOT, 'src/client/lib/api.js'),
  }

  const federationPlugin = []

  // Firebase-Build: Sub-Repo-eigene firebase.js-Inits (fitness-dev, fuel-dev)
  // auf die Shell-Init umleiten — genau eine initializeApp/initializeFirestore
  // im Bundle, Config aus @firebase-config. enforce:'pre' nötig, damit der
  // Hook vor vite:resolve läuft — im Gegensatz zum toten journalDbPlugin
  // (s.o.) greift das hier, weil relative Imports nicht von der Alias-
  // Resolution abgefangen werden.
  const SHELL_FIREBASE = resolve(VITALOS_SRC, 'cloud/firebase.js')
  const SUBREPO_FIREBASE = new Set([
    resolve(FITNESS_SRC, 'firebase.js'),
    resolve(FUEL_ROOT, 'src/client/lib/firebase.js'),
  ])
  const firebaseRedirect = {
    name: 'vitalos:subrepo-firebase-redirect',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!isFirebase || !importer || !source.startsWith('.')) return null
      const resolved = resolve(dirname(importer.split('?')[0]), source)
      if (SUBREPO_FIREBASE.has(resolved) || SUBREPO_FIREBASE.has(`${resolved}.js`)) {
        return SHELL_FIREBASE
      }
      return null
    },
  }

  return {
    root: __dirname,
    base: '/',
    plugins: [
      firebaseRedirect,
      react(),
      ...federationPlugin,
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'script',
        filename: 'sw.js',
        manifest: {
          name: 'VitalOS',
          short_name: 'VitalOS',
          description: 'VitalOS — Fitness, Fuel, Journal, Habits, Learn',
          theme_color: '#0a0a0f',
          background_color: '#0a0a0f',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/session/, /^\/journal/, /^\/fitness/, /^\/health/],
          runtimeCaching: [
            {
              urlPattern: /^\/api\//,
              handler: 'NetworkFirst',
              options: { cacheName: 'vitalos-api', networkTimeoutSeconds: 5 },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: aliases,
      dedupe: ['react', 'react-dom', '@tanstack/react-query', 'lucide-react'],
    },
    css: {
      postcss: {
        plugins: [tailwindcss({ config: resolve(__dirname, 'tailwind.config.cjs') })],
      },
    },
    server: {
      port: 9190,
      proxy: {
        '/exercises': BACKEND,
        '/session':   BACKEND,
        '/journal':   BACKEND,
        '/coverage':  BACKEND,
        '/plan':      BACKEND,
        '/blocks':    BACKEND,
        '/theme':     BACKEND,
        '/health':    BACKEND,
        '/fitness':   BACKEND,
        '/firestore': BACKEND,
        '/habitsync': BACKEND,
        // relax (:9123) — eigener Prefix, /journal & /session gehören fitness
        '/relax-api': {
          target: RELAX_BACKEND,
          rewrite: (path) => path.replace(/^\/relax-api/, ''),
        },
      },
    },
    build: {
      outDir:      resolve(__dirname, isFirebase ? 'dist-firebase' : 'dist'),
      emptyOutDir: true,
      target:      'esnext',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        ...(!isFirebase && {
          output: {
            manualChunks: {
              react:   ['react', 'react-dom'],
              charts:  ['recharts'],
              icons:   ['lucide-react'],
              bodymap: ['react-body-highlighter'],
            },
          },
        }),
      },
    },
  }
})
