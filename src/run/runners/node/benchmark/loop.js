import now from 'precise-now'

import {
  performBeforeAsync,
  performBeforeSync,
  performAfterAsync,
  performAfterSync,
} from './before_after.js'
import { getDurationAsync, getDurationSync } from './duration.js'

// Get measurements iteratively
export const benchmarkLoopAsync = async function ({
  main,
  before,
  after,
  repeat,
  runEnd,
  maxTimes,
  times,
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutating-methods
    times.push(await measureAsync({ main, before, after, repeat }))
  } while (!shouldStopLoop(maxTimes, times, runEnd))
}

export const benchmarkLoopSync = function ({
  main,
  before,
  after,
  repeat,
  runEnd,
  maxTimes,
  times,
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(measureSync({ main, before, after, repeat }))
  } while (!shouldStopLoop(maxTimes, times, runEnd))
}

// We perform benchmarking iteratively until either:
//  - `maxTimes` measurements have been taken
//  - `maxDuration` nanoseconds have elapsed
// We ensure at least one measurement is taken
const shouldStopLoop = function (maxTimes, times, runEnd) {
  return (maxTimes !== undefined && times.length >= maxTimes) || now() >= runEnd
}

const measureAsync = async function ({ main, before, after, repeat }) {
  const beforeArgs = await performBeforeAsync(before, repeat)
  const duration = await getDurationAsync(main, repeat, beforeArgs)
  await performAfterAsync(after, repeat, beforeArgs)
  return duration
}

const measureSync = function ({ main, before, after, repeat }) {
  const beforeArgs = performBeforeSync(before, repeat)
  const duration = getDurationSync(main, repeat, beforeArgs)
  performAfterSync(after, repeat, beforeArgs)
  return duration
}
