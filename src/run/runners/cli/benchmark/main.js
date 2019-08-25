import { now } from '../../../../now.js'
import { sortNumbers } from '../../../../utils/sort.js'

import { measure } from './measure.js'

// Measure how long a task takes.
// Run the benchmark for a specific amount of time.
// We perform benchmarking iteratively in order to stop benchmarking exactly
// when the `duration` or `MAX_LOOPS` has been reached.
export const benchmark = async function({
  main,
  before,
  after,
  variables,
  shell,
  duration,
}) {
  const runEnd = now() + duration
  const times = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const time = await measure({
      main,
      before,
      after,
      variables,
      shell,
      stdio: 'ignore',
    })
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(time)
  } while (!shouldStop(runEnd, times))

  const timesA = normalizeTimes(times)
  const count = times.length
  return { times: timesA, count }
}

// The benchmark stops if either:
//  - we reach the end of the `duration`
//  - we run more than `MAX_LOOPS` iterations
const shouldStop = function(runEnd, times) {
  return now() >= runEnd || times.length >= MAX_LOOPS
}

const OUTLIERS_THRESHOLD = 0.15
// We limit the max number of iterations because:
//  - after many iterations have been run, the precision does not increase much
//    anymore. The extra `duration` should instead be spent launching more child
//    processes which are more effective at increasing precision.
//  - this prevents hitting the process maximum memory limit.
// This number if corrected by `OUTLITERS_THRESHOLD` so the final `loops` looks
// round after removing outliers.
const RAW_MAX_LOOPS = 1e3
const MAX_LOOPS = Math.floor(RAW_MAX_LOOPS / (1 - OUTLIERS_THRESHOLD))

// Remove outliers to increase precision
const normalizeTimes = function(times) {
  sortNumbers(times)

  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const timesA = times.slice(0, outliersLimit)
  return timesA
}
