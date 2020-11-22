import now from 'precise-now'

import { spawnNoOutput } from '../spawn.js'

import { performBefore, performAfter } from './before_after.js'

// Measure how long a task takes.
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
  const measures = []
  const measureEnd = now() + duration
  await performLoops({
    main,
    before,
    after,
    variables,
    shell,
    measures,
    measureEnd,
  })
  return { measures, times: measures.length }
}

const performLoops = async function ({
  main,
  before,
  after,
  variables,
  shell,
  measures,
  measureEnd,
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutating-methods, no-await-in-loop
    measures.push(await performLoop({ main, before, after, variables, shell }))
  } while (!shouldStopMeasuring(measureEnd))
}

export const performLoop = async function ({
  main,
  before,
  after,
  variables,
  shell,
  debug,
}) {
  const variablesA = await performBefore({ before, variables, shell, debug })
  const measure = await getDuration({
    main,
    variables: variablesA,
    shell,
    debug,
  })
  await performAfter({ after, variables: variablesA, shell, debug })
  return measure
}

const getDuration = async function ({ main, variables, shell, debug }) {
  const start = now()
  await spawnNoOutput(main, 'Main', { variables, shell, debug })
  return now() - start
}

const shouldStopMeasuring = function (measureEnd) {
  return now() >= measureEnd
}
