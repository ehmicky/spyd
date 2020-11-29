import now from 'precise-now'

import { performBefore, performAfter } from './before_after.js'
import { getDuration } from './duration.js'

export const performLoops = async function ({
  main,
  before,
  after,
  variables,
  shell,
  repeat,
  measureEnd,
  measures,
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutating-methods
    measures.push(
      // eslint-disable-next-line no-await-in-loop
      await performLoop({ main, before, after, variables, shell, repeat }),
    )
  } while (!shouldStopMeasuring(measureEnd))
}

export const performLoop = async function ({
  main,
  before,
  after,
  variables,
  shell,
  repeat,
  debug,
}) {
  const beforeArgs = await performBefore({
    before,
    variables,
    shell,
    debug,
    repeat,
  })
  const measure = await getDuration({
    main,
    variables,
    shell,
    debug,
    repeat,
    beforeArgs,
  })
  await performAfter({ after, variables, shell, debug, repeat, beforeArgs })
  return measure
}

const shouldStopMeasuring = function (measureEnd) {
  return now() >= measureEnd
}
