import now from 'precise-now'

import { startMeasuring } from '../common/start.js'

import { spawnProcess } from './spawn.js'

// Measure how long a task takes.
export const measureTask = async function ({
  main,
  beforeEach,
  afterEach,
  variables,
  shell,
  maxDuration,
}) {
  const { mainMeasures, measureEnd } = startMeasuring(maxDuration)

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    await performLoop({
      main,
      beforeEach,
      afterEach,
      variables,
      shell,
      mainMeasures,
    })
  } while (now() < measureEnd)

  return { mainMeasures }
}

const performLoop = async function ({
  main,
  beforeEach,
  afterEach,
  variables,
  shell,
  mainMeasures,
}) {
  const variablesA = await performBeforeEach({ beforeEach, variables, shell })
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(await getDuration({ main, variables: variablesA, shell }))
  await performAfterEach({ afterEach, variables: variablesA, shell })
}

// Task `beforeEach`. Performed outside measurements.
// Its return value is passed as variable {{beforeEach}} to `main` and
// `afterEach`.
const performBeforeEach = async function ({ beforeEach, variables, shell }) {
  if (beforeEach === undefined) {
    return variables
  }

  const beforeEachVariable = await spawnProcess(beforeEach, {
    variables,
    shell,
    stdout: 'pipeInherit',
    stderr: 'inherit',
  })
  return { ...variables, beforeEach: beforeEachVariable }
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

// Task `afterEach`. Performed outside measurements.
export const performAfterEach = async function ({
  afterEach,
  variables,
  shell,
}) {
  if (afterEach === undefined) {
    return
  }

  await spawnProcess(afterEach, {
    variables,
    shell,
    stdout: 'inherit',
    stderr: 'inherit',
  })
}
