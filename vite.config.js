import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
const JOURNAL_ROOT = resolve(__dirname, 'journal-vos')
const LEARN_ROOT   = resolve(__dirname, 'learn-vos')
const BACKEND      = 'http://localhost:9100'

// Context-aware @db resolver: journal+habits views → journal-dev db, rest → vitalos db
function journalDbPlugin(isFirebase) {
  const journalDb = resolve(JOURNAL_DEV, isFirebase ? 'src/db.js' : 'src/db.js')
  return {
    name: 'journal-db-resolver',
    resolveId(id, importer) {
      if (id !== '@db' || !importer) return
      if (importer.includes('/journal-dev/') || importer.includes('/habits-dev/')) return journalDb
      if (importer.includes('/src/views/Journal/') || importer.includes('/src/views/Habits/')) return journalDb
    },
  }
}

export default defineConfig(({ mode }) => {
  const isFirebase = mode === 'firebase'

  const aliases = {
    '@src':        VITALOS_SRC,
    '@shell':      resolve(VITALOS_SRC, 'shell'),
    '@components': resolve(VITALOS_SRC, 'shell/components'),
    '@lib':        resolve(VITALOS_SRC, 'lib'),
    '@constants':  resolve(FITNESS_SRC, 'constants'),
    '@utils':      resolve(VITALOS_SRC, 'lib/utils.js'),
    '@db':         resolve(VITALOS_SRC, isFirebase ? 'db.firestore.js' : 'db.js'),
    '@habits':     HABITS_DEV,
    '@journal':    JOURNAL_DEV,
    '@learn':      LEARN_DEV,
    '@fitness':    resolve(FITNESS_SRC, '..'),

    // ── Tab Sources (eine Zeile = ein Tab, Herkunft sofort sichtbar) ───────────
    '@view/dashboard':  resolve(VITALOS_SRC,         'shell/Dashboard.jsx'),  // vitalos-spezifisch
    '@view/session':    resolve(FITNESS_SRC,          'views/Session'),        // fitness-dev
    '@view/review':     resolve(FITNESS_SRC,          'views/WeeklyReview'),   // fitness-dev
    '@view/muscles':    resolve(FITNESS_SRC,          'views/Muscles'),        // fitness-dev
    '@view/learn':      resolve(LEARN_DEV,            'src/views/Learn'),      // learn-dev
    '@view/journal':    resolve(JOURNAL_DEV,          'src/views/Journal'),    // journal-dev
    '@view/habits':     resolve(HABITS_DEV,           'src/views/Habits'),     // habits-dev
    '@view/settings':   resolve(VITALOS_SRC,          'shell/Settings'),       // vitalos-spezifisch
    '@view/plan':       resolve(FITNESS_SRC,          'views/Plan'),           // fitness-dev
    '@view/coach':      resolve(FITNESS_SRC,          'views/Coach'),          // fitness-dev

    'journal/JournalApp': resolve(VITALOS_SRC, 'apps/JournalApp.jsx'),
    'learn/LearnApp':     resolve(VITALOS_SRC, 'apps/LearnApp.jsx'),
    'fuel/FuelApp':       resolve(VITALOS_SRC, 'shell/FuelApp.jsx'),
    '@fuel':              resolve(FUEL_ROOT, 'src/client'),
    '@fuel-shared':       resolve(FUEL_ROOT, 'src/shared'),
    '@journal-vos':       resolve(JOURNAL_ROOT, 'src'),
    '@learn-vos':         resolve(LEARN_ROOT, 'src'),
  }

  const federationPlugin = []

  return {
    root: __dirname,
    base: '/',
    plugins: [react(), journalDbPlugin(isFirebase), ...federationPlugin],
    resolve: {
      alias: aliases,
      dedupe: ['react', 'react-dom', '@tanstack/react-query', 'lucide-react'],
      preserveSymlinks: true,
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
