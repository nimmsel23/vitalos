import test from 'node:test'
import assert from 'node:assert/strict'
import { getProductEdition } from '../src/shell/productEdition.js'

test('Observe and Operate are branded editions of the same shell product contract', () => {
  assert.deepEqual(getProductEdition('observe'), {
    id: 'observe',
    name: 'VitalOS Observe',
    shortName: 'Observe',
    tagline: 'Wahrnehmen. Festhalten. In deinem Tempo.',
  })
  assert.deepEqual(getProductEdition('operate'), {
    id: 'operate',
    name: 'VitalOS Operate',
    shortName: 'Operate',
    tagline: 'Aus Klarheit wird Handlung.',
  })
})

test('unknown or missing edition safely retains the existing VitalOS shell', () => {
  assert.equal(getProductEdition('unknown').id, 'core')
  assert.equal(getProductEdition().id, 'core')
})
