import now from 'precise-now'

import { preciseTimestamp } from '../../../../measure/precise_timestamp.js'

import { performLoopsAsync } from './async/loops.js'
import { performLoopsSync } from './sync/loops.js'

// Call the `main` function iteratively and return an array of `times` measuring
// how long each call took.
export const measureTask = async function ({
  main,
  before,
  after,
  async,
  repeat,
  maxDuration,
}) {
  const times = []
  const start = String(preciseTimestamp())
  const measureEnd = now() + maxDuration
  await performLoops({
    main,
    before,
    after,
    async,
    repeat,
    measureEnd,
    times,
  })
  return { times, start }
}

// We separate async and sync measurements because following a promise (`await`)
// can take several microseconds, which does not work when measuring fast
// synchronous functions.
const performLoops = function ({
  main,
  before,
  after,
  async,
  repeat,
  measureEnd,
  times,
}) {
  if (async) {
    return performLoopsAsync({ main, before, after, repeat, measureEnd, times })
  }

  return performLoopsSync({ main, before, after, repeat, measureEnd, times })
}
