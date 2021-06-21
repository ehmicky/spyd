import test from 'ava'
import { bench } from 'spyd'

test('Smoke test', (t) => {
  t.is(typeof bench, 'function')
})
