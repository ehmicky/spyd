import test from 'ava'
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import { bench } from 'spyd'

test('Smoke test', (t) => {
  t.is(typeof bench, 'function')
})
