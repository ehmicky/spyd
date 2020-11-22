import now from 'precise-now'

import { preciseTimestamp } from '../../../../measure/precise_timestamp.js'

import { benchmarkLoopAsync } from './async/loop.js'
import { benchmarkLoopSync } from './sync/loop.js'

// Call the `main` function iteratively and return an array of `times` measuring
// how long each call took.
export const benchmark = async function ({
  main,
  before,
  after,
  async,
  repeat,
  maxDuration,
}) {
  const times = []
  const start = String(preciseTimestamp())
  const runEnd = now() + maxDuration
  await benchmarkLoop({
    main,
    before,
    after,
    async,
    repeat,
    runEnd,
    times,
  })
  return { times, start }
}

// We separate async and sync measurements because following a promise (`await`)
// can take several microseconds, which does not work when measuring fast
// synchronous functions.
const benchmarkLoop = function ({
  main,
  before,
  after,
  async,
  repeat,
  runEnd,
  times,
}) {
  if (async) {
    return benchmarkLoopAsync({ main, before, after, repeat, runEnd, times })
  }

  return benchmarkLoopSync({ main, before, after, repeat, runEnd, times })
}
