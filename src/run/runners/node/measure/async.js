import now from 'precise-now'

import { getTaskArgs } from './arg.js'
import { addEmptyMeasure } from './empty.js'

export const performLoopsAsync = async function ({
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
    // eslint-disable-next-line no-await-in-loop
    await performLoopAsync({
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

const performLoopAsync = async function ({
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
  await performHookAsync(beforeEach, taskArgs)
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(await getDurationAsync(main, taskArgs))
  await performHookAsync(afterEach, taskArgs)
}

// Each `beforeEach`/`afterEach` is executed serially to prevent hitting OS
// resources limits (such as max number of open files)
const performHookAsync = async function (hook, taskArgs) {
  if (hook === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops
  for (const taskArg of taskArgs) {
    // eslint-disable-next-line no-await-in-loop
    await hook(taskArg)
  }
}

const getDurationAsync = async function (main, taskArgs) {
  const start = now()

  // eslint-disable-next-line fp/no-loops
  for (const taskArg of taskArgs) {
    // eslint-disable-next-line no-await-in-loop
    await main(taskArg)
  }

  return now() - start
}
