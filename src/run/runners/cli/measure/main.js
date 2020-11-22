import now from 'precise-now'

import { measure } from './loop.js'

// Measure how long a task takes.
// Measure for a specific amount of time.
// We take measures iteratively in order to stop exactly when the `duration`
// has been reached.
export const measureTask = async function ({
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

  return { times, count: times.length }
}
