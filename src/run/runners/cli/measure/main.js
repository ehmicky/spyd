import now from 'precise-now'

import { spawnNoOutput } from '../spawn.js'

import { performBefore, performAfter } from './before_after.js'

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
  const times = []
  const measureEnd = now() + duration
  await performLoops({
    main,
    before,
    after,
    variables,
    shell,
    times,
    measureEnd,
  })
  return { times, count: times.length }
}

const performLoops = async function ({
  main,
  before,
  after,
  variables,
  shell,
  times,
  measureEnd,
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const time = await performLoop({
      main,
      before,
      after,
      variables,
      shell,
    })
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(time)
  } while (!shouldStopMeasuring(measureEnd))
}

const performLoop = async function ({
  main,
  before,
  after,
  variables,
  shell,
  debug,
}) {
  const variablesA = await performBefore({ before, variables, shell, debug })
  const time = await getDuration({ main, variables: variablesA, shell, debug })
  await performAfter({ after, variables: variablesA, shell, debug })
  return time
}

const getDuration = async function ({ main, variables, shell, debug }) {
  const start = now()
  await spawnNoOutput(main, 'Main', { variables, shell, debug })
  return now() - start
}

const shouldStopMeasuring = function (measureEnd) {
  return now() >= measureEnd
}
