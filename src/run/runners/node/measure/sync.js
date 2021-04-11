import now from 'precise-now'

import { getTaskArgs } from './arg.js'

// Perform measuring loops iteratively
export const performLoopsSync = function ({
  main,
  beforeEach,
  afterEach,
  taskArg,
  maxLoops,
  repeat,
}) {
  const measures = new Array(maxLoops)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < measures.length; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    measures[index] = performLoopSync({
      main,
      beforeEach,
      afterEach,
      taskArg,
      repeat,
    })
  }

  return measures
}

const performLoopSync = function ({
  main,
  beforeEach,
  afterEach,
  taskArg,
  repeat,
}) {
  const taskArgs = getTaskArgs(taskArg, repeat)

  performHookSync(beforeEach, taskArgs)
  const duration = getDurationSync(main, taskArgs)
  performHookSync(afterEach, taskArgs)
  return duration
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

export const getDurationSync = function (main, taskArgs) {
  const start = now()

  // eslint-disable-next-line fp/no-loops
  for (const taskArg of taskArgs) {
    main(taskArg)
  }

  return now() - start
}
