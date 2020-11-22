import { shouldStopMeasuring } from '../stop.js'

import { performBeforeSync, performAfterSync } from './before_after.js'
import { getDurationSync } from './duration.js'

// Perform measuring loops iteratively
export const performLoopsSync = function ({
  main,
  before,
  after,
  repeat,
  measureEnd,
  times,
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(performLoopSync({ main, before, after, repeat }))
  } while (!shouldStopMeasuring(measureEnd))
}

const performLoopSync = function ({ main, before, after, repeat }) {
  const beforeArgs = performBeforeSync(before, repeat)
  const duration = getDurationSync(main, repeat, beforeArgs)
  performAfterSync(after, repeat, beforeArgs)
  return duration
}
