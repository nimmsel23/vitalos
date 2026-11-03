const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const { VitePWA } = require('vite-plugin-pwa')
const path = require('path')
const ROOT = path.resolve(__dirname, '..')
const FITNESS = path.join(ROOT, 'fitness-app')

module.exports = defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      manifest: require('./public/manifest.json'),
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
    }),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@db': path.join(FITNESS, 'src/lib/db/index.firestore.js'),
      '@firebase-config': path.join(ROOT, 'firebase.config.js'),
    },
    dedupe: ['react', 'react-dom', 'firebase'],
  },
  build: { outDir: 'dist', emptyOutDir: true },
})
