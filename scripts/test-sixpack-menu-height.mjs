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

test('6Pack-Menü in der Shell bleibt mindestens halbe Bildschirmhöhe', async () => {
  const app = await readFile(new URL('../prod/src/shell/CoreSkillsApp.jsx', import.meta.url), 'utf8')
  const css = await readFile(new URL('../prod/src/shell/core-skills.css', import.meta.url), 'utf8')
  assert.match(app, /data-sixpack-frame/)
  assert.match(app, /core-skills-sixpack-frame/)
  assert.match(app, /--mobile-nav-height/)
  assert.match(app, /visualViewport/)
  const frame = css.slice(css.indexOf('.core-skills-sixpack-frame {'), css.indexOf('.core-skills-sixpack-frame > section'))
  for (const unit of ['100vh', '100svh', '100dvh']) {
    assert.match(frame, new RegExp(`height:\\s*calc\\(${unit} - var\\(--sixpack-top, 0px\\) - var\\(--sixpack-nav, 0px\\)\\)`))
  }
  const menu = css.slice(css.indexOf('.core-skills-sixpack-frame .grid.flex-1'), css.indexOf('.core-skills-sixpack-frame .flex-1.basis-0'))
  for (const floor of ['50vh', '50svh', '50dvh']) assert.match(menu, new RegExp(`min-height:\\s*${floor}`))
  assert.match(css, /halbe Bildschirmhöhe/)
  assert.match(css, /bf02ea6/)
  assert.match(css, /88ac3bf/)
})
