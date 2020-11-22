import now from 'precise-now'

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
  maxTimes,
}) {
  const times = []
  const runEnd = now() + maxDuration
  await benchmarkLoop({
    main,
    before,
    after,
    async,
    repeat,
    runEnd,
    maxTimes,
    times,
  })
  return times
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
  maxTimes,
  times,
}) {
  if (async) {
    return benchmarkLoopAsync({
      main,
      before,
      after,
      repeat,
      runEnd,
      maxTimes,
      times,
    })
  }

  return benchmarkLoopSync({
    main,
    before,
    after,
    repeat,
    runEnd,
    maxTimes,
    times,
  })
}
