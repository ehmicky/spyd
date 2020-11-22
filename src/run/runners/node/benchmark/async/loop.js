import { shouldStopLoop } from '../stop.js'

import { performBeforeAsync, performAfterAsync } from './before_after.js'
import { getDurationAsync } from './duration.js'

export const benchmarkLoopAsync = async function ({
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
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    lastTime = await measureAsync({ main, before, after, repeat })
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(lastTime)
  } while (!shouldStopLoop(runEnd, lastTime))
}

const measureAsync = async function ({ main, before, after, repeat }) {
  const beforeArgs = await performBeforeAsync(before, repeat)
  const duration = await getDurationAsync(main, repeat, beforeArgs)
  await performAfterAsync(after, repeat, beforeArgs)
  return duration
}
