import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname   = dirname(fileURLToPath(import.meta.url))
const FITNESS_DEV = resolve(__dirname, '../fitness-dev')
const FITNESS_SRC = resolve(FITNESS_DEV, 'src')

export default defineConfig({
  root: __dirname,
  base: '/',
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@src':                FITNESS_SRC,
      '@db':                 resolve(FITNESS_SRC, 'lib/db/index.js'), // local mode for standalone fitness
      '@utils':              resolve(FITNESS_SRC, 'lib/utils.js'),
      '@aliase':             resolve(FITNESS_DEV, 'catalog/kb/aliases.yml'),
      '@fitness/components': resolve(FITNESS_SRC, 'components'),
      '@fitness/constants':  resolve(FITNESS_SRC, 'constants'),
      '@fitness':            FITNESS_SRC,
      '@components':         resolve(FITNESS_SRC, 'components'),
      '@fuel':               resolve(__dirname, '../fuel-dev/src/client'),
      '@habits':             resolve(__dirname, '../habits-dev/src'),
      '@journal':            resolve(__dirname, '../journal-dev/src'),
      '@learn':              resolve(__dirname, '../learn-dev/src'),
    },
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
  css: {
    postcss: {
      plugins: [tailwindcss({ config: resolve(__dirname, 'tailwind.config.cjs') })],
    },
  },
  server: {
    port: 9140, // Different from fitness-dev (5902) or vitalos (9190)
    proxy: {
      '/api': 'http://localhost:9100', // Forward API to fitness-dev backend if needed
      '/firestore': 'http://localhost:9100',
    }
  }
})
