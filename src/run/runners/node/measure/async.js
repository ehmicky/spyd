import now from 'precise-now'

import { getTaskArgs } from './arg.js'

export const performLoopsAsync = async function ({
  main,
  beforeEach,
  afterEach,
  taskArg,
  repeat,
  maxLoops,
}) {
  const measures = new Array(maxLoops)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < measures.length; index += 1) {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    measures[index] = await performLoopAsync({
      main,
      beforeEach,
      afterEach,
      taskArg,
      repeat,
    })
  }

  return measures
}

const performLoopAsync = async function ({
  main,
  beforeEach,
  afterEach,
  taskArg,
  repeat,
}) {
  const taskArgs = getTaskArgs(taskArg, repeat)

  await performHookAsync(beforeEach, taskArgs)
  const duration = await getDurationAsync(main, taskArgs)
  await performHookAsync(afterEach, taskArgs)
  return duration
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
