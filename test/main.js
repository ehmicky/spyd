import test from 'ava'
import { run } from 'spyd'

test('Smoke test', (t) => {
  t.is(typeof run, 'function')
})
