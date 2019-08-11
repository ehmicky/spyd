import test from 'ava'

import spyd from '../src/main.js'

test('Smoke test', t => {
  t.is(typeof spyd, 'function')
})
