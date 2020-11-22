import { shouldStopLoop } from '../stop.js'

import { performBeforeAsync, performAfterAsync } from './before_after.js'
import { getDurationAsync } from './duration.js'

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

const measureAsync = async function ({ main, before, after, repeat }) {
  const beforeArgs = await performBeforeAsync(before, repeat)
  const duration = await getDurationAsync(main, repeat, beforeArgs)
  await performAfterAsync(after, repeat, beforeArgs)
  return duration
}
