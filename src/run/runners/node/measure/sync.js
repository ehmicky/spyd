import now from 'precise-now'

import { getTaskArgs } from './arg.js'
import { addEmptyMeasure } from './empty.js'

// Perform measuring loops iteratively
export const performLoopsSync = function ({
  main,
  beforeEach,
  afterEach,
  taskArg,
  repeat,
  maxLoops,
  mainMeasures,
  emptyMeasures,
}) {
  // eslint-disable-next-line fp/no-loops
  while (mainMeasures.length < maxLoops) {
    performLoopSync({
      main,
      beforeEach,
      afterEach,
      taskArg,
      repeat,
      mainMeasures,
      emptyMeasures,
    })
  }
}

const performLoopSync = function ({
  main,
  beforeEach,
  afterEach,
  taskArg,
  repeat,
  mainMeasures,
  emptyMeasures,
}) {
  addEmptyMeasure(emptyMeasures)

  const taskArgs = getTaskArgs(taskArg, repeat)

  try {
    performHookSync(beforeEach, taskArgs)
    // eslint-disable-next-line fp/no-mutating-methods
    mainMeasures.push(getDurationSync(main, taskArgs))
  } catch (error) {
    silentAfterEachSync(afterEach, taskArgs)
    throw error
  }

  performHookSync(afterEach, taskArgs)
}

// `afterEach` is always performed for cleanup, even when `beforeEach` or `main`
// throws. Since some `taskArgs` might be in different states, or some might be
// left in the middle of some intermediate state, the cleanup code itself might
// fail. So we make that failure silent.
const silentAfterEachSync = function (afterEach, taskArgs) {
  try {
    performHookSync(afterEach, taskArgs)
  } catch {}
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
