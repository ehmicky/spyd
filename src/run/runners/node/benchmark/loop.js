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
  duration,
  async,
  nowBias,
  loopBias,
  repeat,
  maxTimes,
}) {
  const runEnd = now() + duration
  const times = []
  // eslint-disable-next-line fp/no-let
  let loop = 0

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
    // eslint-disable-next-line fp/no-mutation
    loop += 1
  } while (!shouldStopLoop(maxTimes, loop, runEnd))

  return { times, count: times * repeat }
}

const shouldStopLoop = function (maxTimes, loop, runEnd) {
  return (maxTimes !== undefined && loop >= maxTimes) || now() >= runEnd
}
