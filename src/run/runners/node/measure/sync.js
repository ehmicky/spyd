import now from 'precise-now'

import { getTaskArgs } from './arg.js'

// Perform measuring loops iteratively
export const performLoopsSync = function ({
  main,
  beforeEach,
  afterEach,
  taskArg,
  repeat,
  maxLoops,
  measures,
}) {
  // eslint-disable-next-line fp/no-loops
  while (measures.length < maxLoops) {
    performLoopSync({ main, beforeEach, afterEach, taskArg, repeat, measures })
  }
}

const performLoopSync = function ({
  main,
  beforeEach,
  afterEach,
  taskArg,
  repeat,
  measures,
}) {
  const taskArgs = getTaskArgs(taskArg, repeat)

  performHookSync(beforeEach, taskArgs)
  // eslint-disable-next-line fp/no-mutating-methods
  measures.push(getDurationSync(main, taskArgs))
  performHookSync(afterEach, taskArgs)
}

// Task `beforeEach()`/`afterEach()`. Performed outside measurements.
// `beforeEach`, `main` and `afterEach` should communicate using context objects
const performHookSync = function (hook, taskArgs) {
  if (hook === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops
  for (const taskArg of taskArgs) {
    hook(taskArg)
  }
}

const getDurationSync = function (main, taskArgs) {
  const start = now()

  // eslint-disable-next-line fp/no-loops
  for (const taskArg of taskArgs) {
    main(taskArg)
  }

  return now() - start
}
