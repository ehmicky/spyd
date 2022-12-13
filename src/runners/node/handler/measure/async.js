import now from 'precise-now'

import { addContext } from './context.js'

export const performLoopsAsync = async ({
  main,
  beforeEach,
  afterEach,
  inputs,
  repeat,
  maxLoops,
}) => {
  const measures = new Array(maxLoops)
  const { length } = measures

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < length; index += 1) {
    // eslint-disable-next-line fp/no-mutation, no-await-in-loop
    measures[index] = await performLoopAsync({
      main,
      beforeEach,
      afterEach,
      inputs,
      repeat,
    })
  }

  return measures
}

const performLoopAsync = async ({
  main,
  beforeEach,
  afterEach,
  inputs,
  repeat,
}) => {
  const allInputs = addContext(inputs, repeat)

  await performHookAsync(beforeEach, allInputs)
  const duration = await getDurationAsync(main, allInputs)
  await performHookAsync(afterEach, allInputs)
  return duration
}

// Each `beforeEach`/`afterEach` is executed serially to prevent hitting OS
// resources limits (such as max number of open files)
const performHookAsync = async (hook, allInputs) => {
  if (hook === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops
  for (const inputs of allInputs) {
    // eslint-disable-next-line no-await-in-loop
    await hook(inputs)
  }
}

const getDurationAsync = async (main, allInputs) => {
  const start = now()

  // eslint-disable-next-line fp/no-loops
  for (const inputs of allInputs) {
    // eslint-disable-next-line no-await-in-loop
    await main(inputs)
  }

  return now() - start
}
