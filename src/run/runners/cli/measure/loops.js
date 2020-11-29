import now from 'precise-now'

import { spawnProcess } from '../spawn.js'

import { performBefore, performAfter } from './before_after.js'

export const performLoops = async function ({
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

export const performLoop = async function ({
  main,
  before,
  after,
  variables,
  shell,
}) {
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
