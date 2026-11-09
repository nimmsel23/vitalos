#!/usr/bin/env node
/**
 * Kopiert Biome/Knip-Vorlagen nach ~/dev/*-dev (+ backend) und setzt engines + scripts.
 * Aufruf aus ~/vitalos: node tooling/apply-to-dev.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const TOOLING = dirname(fileURLToPath(import.meta.url))
const DEV = join(TOOLING, '../../dev')
const REPOS = [
  'fitness-dev',
  'fuel-dev',
  'journal-dev',
  'habits-dev',
  'plan-dev',
  'learn-dev',
  'relax-dev',
  'coach-dev',
  '6pack-dev',
  'skills-dev',
  'backend',
]

const BIOME_PIN = '@biomejs/biome@2.6.6'
const KNIP_PIN = 'knip@6.44.2'
const SYNCPACK_PIN = 'syncpack@13.0.4'

const SMOKE = `import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

test('package.json has name + engines.node', () => {
  assert.equal(typeof pkg.name, 'string')
  assert.ok(pkg.name.length > 0)
  assert.ok(pkg.engines?.node, 'engines.node fehlt')
})
`

function mergeScripts(pkg) {
  const scripts = { ...(pkg.scripts || {}) }
  scripts['tooling:biome'] = `pnpm dlx ${BIOME_PIN} check --formatter-enabled=true --linter-enabled=true .`
  scripts['tooling:knip'] = `pnpm dlx ${KNIP_PIN}`
  scripts['tooling:check'] = 'pnpm run tooling:biome && pnpm run tooling:knip'
  if (!scripts.test && !scripts['test:unit'] && !scripts['test:plan']) {
    scripts.test = 'node --test scripts/smoke.test.mjs'
  }
  return scripts
}

function ensureEngines(pkg) {
  const engines = { ...(pkg.engines || {}) }
  if (!engines.node) engines.node = '>=22.13'
  return engines
}

function writeKnip(repoDir, name) {
  const base = JSON.parse(readFileSync(join(TOOLING, 'knip.base.json'), 'utf8'))
  // Repo-spezifische Entries
  if (name === 'backend') {
    base.entry = ['server.mjs', 'scripts/**/*.{js,mjs,cjs}', 'server/**/*.{js,mjs}']
    base.project = ['server/**/*.{js,mjs}', 'scripts/**/*.{js,mjs,cjs}']
  }
  if (existsSync(join(repoDir, 'apps'))) {
    base.workspaces = { '.': {}, 'apps/*': {} }
  }
  writeFileSync(join(repoDir, 'knip.json'), `${JSON.stringify(base, null, 2)}\n`)
}

for (const name of REPOS) {
  const root = join(DEV, name)
  const pkgPath = join(root, 'package.json')
  if (!existsSync(pkgPath)) {
    console.warn(`skip ${name}: no package.json`)
    continue
  }
  copyFileSync(join(TOOLING, 'biome.json'), join(root, 'biome.json'))
  writeKnip(root, name)

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  pkg.engines = ensureEngines(pkg)
  if (!pkg.packageManager) pkg.packageManager = 'pnpm@11.3.0'
  pkg.scripts = mergeScripts(pkg)
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  if (pkg.scripts.test === 'node --test scripts/smoke.test.mjs') {
    mkdirSync(join(root, 'scripts'), { recursive: true })
    const smoke = join(root, 'scripts', 'smoke.test.mjs')
    if (!existsSync(smoke)) writeFileSync(smoke, SMOKE)
  }
  console.log(`ok ${name}`)
}

// vitalos meta selbst
const vitalosPkgPath = join(TOOLING, '../package.json')
const vitalosPkg = JSON.parse(readFileSync(vitalosPkgPath, 'utf8'))
vitalosPkg.engines = ensureEngines(vitalosPkg)
vitalosPkg.scripts = {
  ...vitalosPkg.scripts,
  'tooling:biome': `pnpm dlx ${BIOME_PIN} check --formatter-enabled=true --linter-enabled=true .`,
  'tooling:knip': `pnpm dlx ${KNIP_PIN}`,
  'tooling:syncpack': `pnpm dlx ${SYNCPACK_PIN} list-mismatches --config tooling/syncpack.config.cjs`,
  'tooling:check': 'pnpm run tooling:biome && pnpm run tooling:knip && pnpm run tooling:syncpack',
}
writeFileSync(vitalosPkgPath, `${JSON.stringify(vitalosPkg, null, 2)}\n`)
copyFileSync(join(TOOLING, 'biome.json'), join(TOOLING, '../biome.json'))
writeKnip(join(TOOLING, '..'), 'vitalos')
console.log('ok vitalos')
