import now from 'precise-now'

import { startMeasuring } from '../common/start.js'

import { spawnProcess } from './spawn.js'

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
  const { measures, start, measureEnd } = startMeasuring(maxDuration)

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutating-methods
    measures.push(await performLoop({ main, before, after, variables, shell }))
  } while (now() < measureEnd)

  return { measures, start }
}

const performLoop = async function ({ main, before, after, variables, shell }) {
  const variablesA = await performBefore({ before, variables, shell })
  const measure = await getDuration({ main, variables: variablesA, shell })
  await performAfter({ after, variables: variablesA, shell })
  return measure
}

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main` and `after`.
const performBefore = async function ({ before, variables, shell }) {
  if (before === undefined) {
    return variables
  }

  const beforeVariable = await spawnProcess(before, {
    variables,
    shell,
    stdout: 'pipeInherit',
    stderr: 'inherit',
  })
  return { ...variables, before: beforeVariable }
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

// Task `after`. Performed outside measurements.
export const performAfter = async function ({ after, variables, shell }) {
  if (after === undefined) {
    return
  }

  await spawnProcess(after, {
    variables,
    shell,
    stdout: 'inherit',
    stderr: 'inherit',
  })
}
