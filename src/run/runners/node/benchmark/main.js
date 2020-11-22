import now from 'precise-now'

import { performBefore, performAfter } from './before_after.js'
import { getDuration } from './duration.js'

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

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutating-methods
    times.push(await measure({ main, before, after, repeat, async }))
  } while (!shouldStopLoop(maxTimes, times, runEnd))

  return times
}

// We perform benchmarking iteratively until either:
//  - `maxTimes` measurements have been taken
//  - `maxDuration` nanoseconds have elapsed
// We ensure at least one measurement is taken
const shouldStopLoop = function (maxTimes, times, runEnd) {
  return (maxTimes !== undefined && times.length >= maxTimes) || now() >= runEnd
}

const measure = async function ({ main, before, after, repeat, async }) {
  const beforeArgs = await performBefore(before, repeat)
  const duration = await getDuration({ main, repeat, async, beforeArgs })
  await performAfter(after, repeat, beforeArgs)
  return duration
}
