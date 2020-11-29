import now from 'precise-now'

import { spawnNoOutput } from '../spawn.js'

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

const shouldStopMeasuring = function (measureEnd) {
  return now() >= measureEnd
}

const getDuration = async function ({ main, variables, shell, debug }) {
  const start = now()
  await spawnNoOutput(main, 'Main', { variables, shell, debug })
  return now() - start
}
