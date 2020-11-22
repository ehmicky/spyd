import { shouldStopLoop } from '../stop.js'

import { performBeforeSync, performAfterSync } from './before_after.js'
import { getDurationSync } from './duration.js'

// Get measurements iteratively
export const performLoopSync = function ({
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
    times.push(measureSync({ main, before, after, repeat }))
  } while (!shouldStopLoop(measureEnd))
}

const measureSync = function ({ main, before, after, repeat }) {
  const beforeArgs = performBeforeSync(before, repeat)
  const duration = getDurationSync(main, repeat, beforeArgs)
  performAfterSync(after, repeat, beforeArgs)
  return duration
}
