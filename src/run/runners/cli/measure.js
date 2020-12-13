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
  const { mainMeasures, start, measureEnd } = startMeasuring(maxDuration)

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    await performLoop({ main, before, after, variables, shell, mainMeasures })
  } while (now() < measureEnd)

  return { mainMeasures, start }
}

const performLoop = async function ({
  main,
  before,
  after,
  variables,
  shell,
  mainMeasures,
}) {
  const variablesA = await performBefore({ before, variables, shell })
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(await getDuration({ main, variables: variablesA, shell }))
  await performAfter({ after, variables: variablesA, shell })
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
