import now from 'precise-now'

import { measure } from './measure.js'

// We perform benchmarking iteratively in order to stop benchmarking exactly
// when the `duration` has been reached.
// We also adjust or increment some `state` variables as we take more
// measurements.
// We ensure `times` contains at least one measurement.
export const benchmarkLoop = async function ({
  main,
  before,
  after,
  async,
  nowBias,
  loopBias,
  repeat,
  maxDuration,
  maxTimes,
}) {
  const runEnd = now() + maxDuration
  const times = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const time = await measure({
      main,
      before,
      after,
      nowBias,
      loopBias,
      repeat,
      async,
    })
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(time)
  } while (!shouldStopLoop(maxTimes, times, runEnd))

  return times
}

const shouldStopLoop = function (maxTimes, times, runEnd) {
  return (maxTimes !== undefined && times.length >= maxTimes) || now() >= runEnd
}
