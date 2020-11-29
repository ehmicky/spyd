import test from 'ava'

import { bench } from '../src/main.js'

test('Smoke test', (t) => {
  t.is(typeof bench, 'function')
})
