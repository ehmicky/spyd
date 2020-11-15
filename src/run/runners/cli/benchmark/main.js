import now from 'precise-now'

import { measure } from './measure.js'
import { normalizeResult } from './normalize.js'

// Measure how long a task takes.
// Run the benchmark for a specific amount of time.
// We perform benchmarking iteratively in order to stop benchmarking exactly
// when the `duration` or `MAX_LOOPS` has been reached.
export const benchmark = async function ({
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
    })
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(time)
  } while (now() < runEnd)

  const timesA = normalizeResult(times)
  const count = timesA.length
  return { times: timesA, count }
}
