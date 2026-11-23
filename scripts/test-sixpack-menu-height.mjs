import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { sixpackFrameVars } from '../prod/src/shell/sixpackFrame.js'

test('Rahmenhöhe zieht Tab-Leiste und Safe-Area ab und klemmt negative Offsets', () => {
  assert.deepEqual(sixpackFrameVars(137.4, 'calc(var(--nav-grip-h) + var(--safe-bottom) + var(--tabbar-h))'), {
    '--sixpack-top': '137px',
    '--sixpack-nav': 'calc(var(--nav-grip-h) + var(--safe-bottom) + var(--tabbar-h))',
  })
  assert.deepEqual(sixpackFrameVars(-20, '  '), {
    '--sixpack-top': '0px',
    '--sixpack-nav': '0px',
  })
  assert.equal(sixpackFrameVars(Number.NaN, null)['--sixpack-nav'], '0px')
})

test('Core Skills uses content flow instead of nested viewport scroll frames', async () => {
  const app = await readFile(new URL('../prod/src/shell/CoreSkillsApp.jsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('../prod/src/shell/core-skills.css', import.meta.url), 'utf8')
  assert.match(app, /core-skills-content/)
  assert.doesNotMatch(app, /data-sixpack-frame|useSixpackFrame/)
  assert.doesNotMatch(css, /50dvh|overflow-y: auto/)
  assert.match(app, /aria-pressed=\{!sixpack\}/)
})
