#!/usr/bin/env node
// Play-Store-Grafiken für den Closed Test (C-014).
// Baut die Produkt-Shell lokal (Edition store, Coach-Modus, kein Login)
// und schreibt Feature Graphic plus Phone-Screenshots nach branding/store/.
// Kein Deploy, kein Produktions-Login, keine echten Konten.
import { spawn, spawnSync } from 'node:child_process'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, lstatSync, unlinkSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const PROD = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const REPO = resolve(PROD, '..')
const STORE = resolve(PROD, 'branding/store')
const CHROME = process.env.CHROME || '/usr/local/bin/google-chrome'
const PREVIEW_PORT = 4187
const DEBUG_PORT = 9444
const FUEL_SHARED_COMMIT = '9b017ad^'
const PHONE = { cssWidth: 412, cssHeight: 824, scale: 1080 / 412, pngWidth: 1080, pngHeight: 2160 }

const shots = [
  { file: 'phone-fitness.png', hash: '#today', ready: 'Übung hinzufügen' },
  { file: 'phone-relax.png', hash: '#dash', ready: 'Entspannungszeit' },
  { file: 'phone-skills.png', hash: '#skills', ready: 'Planche' },
  {
    file: 'phone-sixpack.png',
    hash: '#sixpack',
    ready: "TODAY'S WORKOUT",
    click: /today'?s workout/i,
    after: 'Hands Back Tucks',
  },
]

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, { cwd: REPO, stdio: 'inherit', env: process.env, ...opts })
    child.on('error', reject)
    child.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error(`${cmd} ${args.join(' ')} → ${code}`))))
  })
}

function ensureDirLink(path, target) {
  if (existsSync(path)) return false
  mkdirSync(dirname(path), { recursive: true })
  symlinkSync(target, path)
  return true
}

async function ensureFitnessKb() {
  const exercises = resolve(REPO, 'fitness-app/fitness/catalog/kb/exercises/6pack')
  const created = []
  if (!existsSync(exercises)) {
    const kb = '/tmp/vitalos-fitness-kb'
    if (!existsSync(resolve(kb, 'exercises/6pack'))) {
      await run('git', ['clone', '--depth', '1', '--branch', 'main', 'https://github.com/nimmsel23/fitness.git', kb])
    }
    if (ensureDirLink(resolve(REPO, 'fitness-app/fitness/catalog/kb'), kb)) {
      created.push(resolve(REPO, 'fitness-app/fitness/catalog/kb'))
    }
  }
  const yuhonas = resolve(REPO, 'fitness-app/fitness/catalog/kb/vendor/free-exercise-db/dist/exercises.json')
  if (!existsSync(yuhonas)) {
    const kbDir = resolve(REPO, 'fitness-app/fitness/catalog/kb')
    await run('git', ['-C', kbDir, 'submodule', 'update', '--init', 'vendor/free-exercise-db'])
  }
  return created
}

async function ensureFuelShared() {
  const utils = resolve(REPO, 'backend/fuel/src/shared/utils/utils.js')
  if (existsSync(utils)) return null
  const destRoot = '/tmp/vitalos-fuel-shared'
  const list = spawn('git', ['-C', resolve(REPO, 'fuel-app'), 'ls-tree', '-r', '--name-only', FUEL_SHARED_COMMIT, 'src/shared'], { cwd: REPO })
  let names = ''
  list.stdout.on('data', (chunk) => { names += chunk })
  await new Promise((resolvePromise, reject) => {
    list.on('exit', (code) => (code === 0 ? resolvePromise() : reject(new Error('fuel shared list failed'))))
  })
  for (const rel of names.trim().split('\n').filter(Boolean)) {
    const dest = resolve(destRoot, 'fuel', rel)
    mkdirSync(dirname(dest), { recursive: true })
    await new Promise((resolvePromise, reject) => {
      const child = spawn('git', ['-C', resolve(REPO, 'fuel-app'), 'show', `${FUEL_SHARED_COMMIT}:${rel}`], { cwd: REPO })
      const chunks = []
      child.stdout.on('data', (chunk) => chunks.push(chunk))
      child.on('exit', (code) => {
        if (code !== 0) reject(new Error(`git show ${rel} → ${code}`))
        else {
          writeFileSync(dest, Buffer.concat(chunks))
          resolvePromise()
        }
      })
    })
  }
  const link = resolve(REPO, 'backend')
  if (!existsSync(link)) symlinkSync(destRoot, link)
  return link
}

const DEMO_FIREBASE_CONFIG = [
  '// Screenshot-Lauf. Kein echtes Firebase-Projekt. Gitignored.',
  'export const config = {',
  '  apiKey: "screenshot-not-a-real-key",',
  '  authDomain: "localhost",',
  '  projectId: "demo-vitalos-screenshots",',
  '  storageBucket: "demo-vitalos-screenshots.appspot.com",',
  '  messagingSenderId: "000000000000",',
  '  appId: "1:000000000000:web:screenshot",',
  '};',
  'export const firebaseConfig = config;',
  'export const VAPID_KEY = "screenshot-not-a-real-vapid";',
  '',
].join('\n')

let preview = null
let restoreFirebase = () => {}
let removeLinks = () => {}

function freePreviewPort() {
  const result = spawnSync('lsof', ['-ti', `tcp:${PREVIEW_PORT}`], { encoding: 'utf8' })
  const pids = (result.stdout || '').split('\n').map((line) => Number(line)).filter((pid) => pid && pid !== process.pid)
  for (const pid of pids) {
    try { process.kill(pid, 'SIGKILL') } catch { /* already gone */ }
  }
}

function stopPreview() {
  if (preview?.pid) {
    try { process.kill(-preview.pid, 'SIGKILL') } catch { /* group already gone */ }
    try { preview.kill('SIGKILL') } catch { /* already gone */ }
    preview = null
  }
  freePreviewPort()
}

function stopAll() {
  try { restoreFirebase() } catch (error) { console.error(error) }
  stopPreview()
  try { removeLinks() } catch (error) { console.error(error) }
}

process.once('SIGINT', () => { stopAll(); process.exit(130) })
process.once('SIGTERM', () => { stopAll(); process.exit(143) })

function withDemoFirebaseConfig(fn, file = resolve(PROD, '.product-config/firebase.config.js')) {
  mkdirSync(dirname(file), { recursive: true })
  const hadFile = existsSync(file)
  const backup = hadFile ? readFileSync(file) : null
  writeFileSync(file, DEMO_FIREBASE_CONFIG)
  restoreFirebase = () => {
    if (hadFile) writeFileSync(file, backup)
    else {
      try { unlinkSync(file) } catch { /* already removed */ }
    }
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => restoreFirebase())
}

async function generateData() {
  await run(process.execPath, [resolve(REPO, 'fitness-app/scripts/build-sixpack-data.mjs')])
  await run(process.execPath, [resolve(REPO, 'fitness-app/scripts/exercise-data.mjs')])
  await run(process.execPath, [resolve(REPO, 'fitness-app/scripts/build-coaching-notes.mjs')])
  await run(process.execPath, [resolve(REPO, 'fitness-app/scripts/build-bp3d-map.mjs')])
  await run(process.execPath, [resolve(REPO, '6pack-app/build-data.mjs')])
}

function productEnv() {
  return {
    ...process.env,
    VITE_VOS_PRODUCT_BUILD: '1',
    VITE_VOS_EDITION: 'store',
    VITE_FOCUS_DEBUG: '',
  }
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id
    const payload = { id, method, params }
    if (sessionId) payload.sessionId = sessionId
    return new Promise((resolvePromise, reject) => {
      this.pending.set(id, { resolve: resolvePromise, reject })
      this.ws.send(JSON.stringify(payload))
    })
  }
  listen() {
    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data)
      if (!msg.id || !this.pending.has(msg.id)) return
      const { resolve, reject } = this.pending.get(msg.id)
      this.pending.delete(msg.id)
      if (msg.error) reject(new Error(JSON.stringify(msg.error)))
      else resolve(msg.result)
    })
  }
}

async function chromeSession() {
  const profile = '/tmp/vitalos-store-chrome'
  await rm(profile, { recursive: true, force: true })
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ], { stdio: 'ignore' })
  let version
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)
      if (res.ok) { version = await res.json(); break }
    } catch { /* starting */ }
    await delay(100)
  }
  if (!version) throw new Error('Chrome debugging port did not open')
  const ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((resolvePromise, reject) => {
    ws.addEventListener('open', resolvePromise)
    ws.addEventListener('error', reject)
  })
  const browser = new Cdp(ws)
  browser.listen()
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true })
  const send = (method, params) => browser.send(method, params, sessionId)
  await send('Page.enable')
  await send('Runtime.enable')
  return {
    chrome,
    ws,
    send,
    async stop() {
      try { ws.close() } catch { /* already closed */ }
      chrome.kill('SIGKILL')
    },
  }
}

async function screenshot(send, path, width, height, scale) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: scale,
    mobile: scale !== 1,
    screenWidth: width,
    screenHeight: height,
  })
  const png = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
  await writeFile(path, Buffer.from(png.data, 'base64'))
}

async function pageText(send) {
  const evaluated = await send('Runtime.evaluate', {
    expression: 'document.body ? document.body.innerText : ""',
    returnByValue: true,
  })
  return evaluated.result?.value || ''
}

async function waitForText(send, needle) {
  for (let i = 0; i < 50; i++) {
    const text = await pageText(send)
    if (text.includes(needle)) return text
    await delay(200)
  }
  throw new Error(`Text nicht erschienen: ${needle}`)
}

function assertStoreSafe(text, file) {
  const banned = ['KONTAKT-FOLGT', 'example.invalid', 'LOCALHOST', 'ETWAS IST SCHIEFGELAUFEN', 'NICHT ANGEMELDET', 'DebugReminder']
  const hit = banned.find((token) => text.includes(token))
  if (hit) throw new Error(`${file} enthält unzulässigen Text: ${hit}`)
}

async function captureScreens(send) {
  await send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  })
  const base = `http://127.0.0.1:${PREVIEW_PORT}/`
  for (const shot of shots) {
    await send('Page.navigate', { url: base + shot.hash })
    let text = await waitForText(send, shot.ready)
    if (shot.click) {
      const clicked = await send('Runtime.evaluate', {
        expression: `(() => {
          const needle = ${shot.click.toString()};
          const el = [...document.querySelectorAll('button, a, [role="button"]')].find((node) => needle.test(node.textContent || ''));
          if (!el) return '';
          el.click();
          return el.textContent.trim();
        })()`,
        returnByValue: true,
      })
      if (!clicked.result?.value) throw new Error(`${shot.file}: Klickziel fehlt`)
      text = await waitForText(send, shot.after)
    }
    await delay(400)
    text = await pageText(send)
    assertStoreSafe(text, shot.file)
    await screenshot(send, resolve(STORE, shot.file), PHONE.cssWidth, PHONE.cssHeight, PHONE.scale)
    console.log(`screenshot ${shot.file}`)
  }
}

async function captureFeature(send) {
  const html = resolve(STORE, 'feature-graphic.html')
  await send('Page.navigate', { url: `file://${html}` })
  await waitForText(send, 'VitalOS')
  await delay(200)
  await screenshot(send, resolve(STORE, 'feature-graphic.png'), 1024, 500, 1)
  console.log('screenshot feature-graphic.png')
}

function flattenAndCheck() {
  const expected = {
    'feature-graphic.png': [1024, 500],
    'phone-fitness.png': [PHONE.pngWidth, PHONE.pngHeight],
    'phone-relax.png': [PHONE.pngWidth, PHONE.pngHeight],
    'phone-skills.png': [PHONE.pngWidth, PHONE.pngHeight],
    'phone-sixpack.png': [PHONE.pngWidth, PHONE.pngHeight],
  }
  const spec = JSON.stringify(expected)
  const code = `
from PIL import Image
import json, pathlib
store = pathlib.Path(${JSON.stringify(STORE)})
expected = json.loads(${JSON.stringify(spec)})
for name, (w, h) in expected.items():
    path = store / name
    im = Image.open(path).convert("RGB")
    if im.size != (w, h):
        raise SystemExit(f"{name}: {im.size}, erwartet {(w, h)}")
    im.save(path, "PNG")
    raw = path.read_bytes()
    # IHDR color type: signature 8 + len 4 + type 4 + w 4 + h 4 + depth 1
    color = raw[25]
    if color != 2:
        raise SystemExit(f"{name}: PNG-Farbtyp {color}, erwartet 2 (RGB, ohne Alpha)")
    print(f"{name} {w}x{h} RGB")
`
  return run('python3', ['-c', code])
}

async function writeReadme(sha) {
  const date = new Date().toISOString().slice(0, 10)
  const lines = [
    '# Play-Store-Grafiken',
    '',
    `Erzeugt am ${date}. Quellstand beim Lauf: \`${sha}\`.`,
    'Produkt-Build aus `prod/`, Edition `store`, lokaler Coach-Modus (`isLocalMode`).',
    'Kein Firebase-Login, kein Emulator-Konto, keine Nutzerdaten. Leerzustände sind die der lokalen Shell.',
    '',
    'Play-Vorgaben: Feature Graphic 1024×500, 24-bit PNG ohne Alpha.',
    'Phone-Screenshots 1080×2160 (Seitenverhältnis 2:1, kurze Seite 1080, lange Seite 2160).',
    '',
    '| Datei | Pixel | Inhalt |',
    '| --- | --- | --- |',
    '| `feature-graphic.png` | 1024×500 | Wortmarke VitalOS und bestehendes Icon (`prod/public/icon.svg`) |',
    '| `feature-graphic.html` | Quelle | HTML, aus dem die Feature Graphic gerendert wird |',
    '| `phone-fitness.png` | 1080×2160 | Fitness, leeres Training (`#today`) |',
    '| `phone-relax.png` | 1080×2160 | Relax, leerer Tag (`#dash`) |',
    '| `phone-skills.png` | 1080×2160 | Skills, Calisthenics-Liste (`#skills`) |',
    '| `phone-sixpack.png` | 1080×2160 | 6Pack, Tag 1 des mitgelieferten Workouts |',
    '',
    '## Neu erzeugen',
    '',
    'Im Meta-Repo, nach `pnpm install` und `git submodule update --init`:',
    '',
    '```bash',
    'node prod/scripts/store-screenshots.mjs',
    '```',
    '',
    'Das Skript braucht Google Chrome, Python 3 mit Pillow (`python3 -m pip install pillow`) und Netz für den öffentlichen Fitness-Katalog `nimmsel23/fitness` (Übungsdaten, nicht im App-Submodul).',
    `Die Fuel-Shared-Module liegen im privaten Repo \`nimmsel23/backend\`. Fehlt das Checkout, stellt das Skript die letzte im \`fuel-app\`-Commit \`${FUEL_SHARED_COMMIT}\` enthaltene Fassung nur lokal für den Build bereit und verlinkt sie nicht ins Git.`,
    'Die Firebase-Datei `prod/.product-config/firebase.config.js` wird für den Lauf durch eine Demo-Konfiguration ersetzt. Lag sie schon vor, schreibt das Skript sie danach zurück, sonst löscht es sie. Es wird nirgends angemeldet.',
    'Fuel-Screenshots fehlen bewusst: ohne den Fuel-Server bleibt die Ansicht auf „FUEL LÄDT…“.',
    'Journal und Habits zeigen ohne Cloud-Anmeldung Fehler- oder Login-Hinweise und werden nicht aufgenommen.',
    '',
  ]
  await writeFile(resolve(STORE, 'README.md'), lines.join('\n'))
}

async function gitSha() {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('git', ['-C', REPO, 'rev-parse', 'HEAD'])
    let out = ''
    child.stdout.on('data', (chunk) => { out += chunk })
    child.on('exit', (code) => (code === 0 ? resolvePromise(out.trim()) : reject(new Error('git rev-parse failed'))))
  })
}

async function main() {
  if (!existsSync(CHROME)) throw new Error(`Chrome nicht gefunden: ${CHROME}`)
  await mkdir(STORE, { recursive: true })
  const createdKb = await ensureFitnessKb()
  const fuelLink = await ensureFuelShared()
  const sha = await gitSha()
  removeLinks = () => {
    if (fuelLink && existsSync(fuelLink) && lstatSync(fuelLink).isSymbolicLink()) rmSync(fuelLink)
    for (const link of createdKb) {
      if (existsSync(link)) rmSync(link)
    }
  }
  try {
    await withDemoFirebaseConfig(async () => {
      await generateData()
      await run('pnpm', ['--dir', 'prod', 'exec', 'vite', 'build'], { env: productEnv() })
      freePreviewPort()
      preview = spawn('pnpm', ['--dir', 'prod', 'exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT), '--strictPort'], {
        cwd: REPO,
        detached: true,
        stdio: 'ignore',
        env: productEnv(),
      })
      for (let i = 0; i < 50; i++) {
        try {
          const res = await fetch(`http://127.0.0.1:${PREVIEW_PORT}/`)
          if (res.ok) break
        } catch { /* starting */ }
        await delay(200)
        if (i === 49) throw new Error('vite preview did not start')
      }
      const session = await chromeSession()
      try {
        await captureFeature(session.send)
        await captureScreens(session.send)
      } finally {
        await session.stop()
      }
    })
    await flattenAndCheck()
    await writeReadme(sha)
    console.log(`Store-Grafiken stehen in ${STORE}`)
  } finally {
    stopAll()
  }
}

async function checkCleanup() {
  const tempConfig = '/tmp/vitalos-screenshot-firebase-check.js'
  try { unlinkSync(tempConfig) } catch { /* absent */ }
  let sawDemo = false
  try {
    await withDemoFirebaseConfig(async () => {
      sawDemo = readFileSync(tempConfig).includes('screenshot-not-a-real-key')
      throw new Error('boom')
    }, tempConfig)
  } catch (error) {
    if (error.message !== 'boom') throw error
  }
  if (!sawDemo) throw new Error('Demo-Konfiguration wurde nicht geschrieben')
  if (existsSync(tempConfig)) throw new Error('Demo-Konfiguration blieb liegen')
  console.log('firebase restore ok')

  freePreviewPort()
  preview = spawn('pnpm', ['--dir', 'prod', 'exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(PREVIEW_PORT), '--strictPort'], {
    cwd: REPO,
    detached: true,
    stdio: 'ignore',
    env: productEnv(),
  })
  let up = false
  try {
    for (let i = 0; i < 50; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${PREVIEW_PORT}/`)
        if (res.status) { up = true; break }
      } catch { /* starting */ }
      await delay(200)
    }
    if (!up) throw new Error('vite preview did not start for cleanup check')
  } finally {
    stopPreview()
  }
  await delay(400)
  const left = spawnSync('lsof', ['-ti', `tcp:${PREVIEW_PORT}`], { encoding: 'utf8' })
  if ((left.stdout || '').trim()) throw new Error(`preview still listening: ${left.stdout.trim()}`)
  console.log('preview process group stopped')
}

const entry = process.argv.includes('--check-cleanup') ? checkCleanup : main
entry().catch((error) => {
  console.error(error)
  stopAll()
  process.exit(1)
})
