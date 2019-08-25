import test from 'ava'

import { run } from '../src/main.js'

test('Smoke test', t => {
  t.is(typeof run, 'function')
})
