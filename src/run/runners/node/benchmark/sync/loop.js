import { shouldStopLoop } from '../stop.js'

import { performBeforeSync, performAfterSync } from './before_after.js'
import { getDurationSync } from './duration.js'

// Get measurements iteratively
export const benchmarkLoopSync = function ({
  main,
  before,
  after,
  repeat,
  runEnd,
  times,
}) {
  // eslint-disable-next-line fp/no-let
  let lastTime = 0

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutation
    lastTime = measureSync({ main, before, after, repeat })
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(lastTime)
  } while (!shouldStopLoop(runEnd, lastTime))
}

const measureSync = function ({ main, before, after, repeat }) {
  const beforeArgs = performBeforeSync(before, repeat)
  const duration = getDurationSync(main, repeat, beforeArgs)
  performAfterSync(after, repeat, beforeArgs)
  return duration
}
