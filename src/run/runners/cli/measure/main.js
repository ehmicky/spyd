import now from 'precise-now'

import { preciseTimestamp } from '../../../../measure/precise_timestamp.js'
import { spawnProcess } from '../spawn.js'

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
  maxDuration,
}) {
  const measures = []
  const start = String(preciseTimestamp())
  const measureEnd = now() + maxDuration
  await performLoops({
    main,
    before,
    after,
    variables,
    shell,
    measureEnd,
    measures,
  })
  return { measures, start }
}

const performLoops = async function ({
  main,
  before,
  after,
  variables,
  shell,
  measureEnd,
  measures,
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutating-methods
    measures.push(await performLoop({ main, before, after, variables, shell }))
  } while (!shouldStopMeasuring(measureEnd))
}

const performLoop = async function ({ main, before, after, variables, shell }) {
  const variablesA = await performBefore({ before, variables, shell })
  const measure = await getDuration({ main, variables: variablesA, shell })
  await performAfter({ after, variables: variablesA, shell })
  return measure
}

const shouldStopMeasuring = function (measureEnd) {
  return now() >= measureEnd
}

const getDuration = async function ({ main, variables, shell }) {
  const start = now()
  await spawnProcess(main, {
    variables,
    shell,
    stdout: 'inherit',
    stderr: 'inherit',
  })
  return now() - start
}
