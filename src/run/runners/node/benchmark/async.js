import now from 'precise-now'

import { getContexts } from './context.js'
import { addEmptyMeasure } from './empty.js'

export const performLoopsAsync = async function ({
  main,
  beforeEach,
  afterEach,
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
  repeat,
  mainMeasures,
  emptyMeasures,
}) {
  addEmptyMeasure(emptyMeasures)

  const contexts = getContexts(repeat)
  await performHookAsync(beforeEach, contexts)
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(await getDurationAsync(main, contexts))
  await performHookAsync(afterEach, contexts)
}

// Each `beforeEach`/`afterEach` is executed serially to prevent hitting OS
// resources limits (such as max number of open files)
const performHookAsync = async function (hook, contexts) {
  if (hook === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops
  for (const context of contexts) {
    // eslint-disable-next-line no-await-in-loop
    await hook.call(context)
  }
}

const getDurationAsync = async function (main, contexts) {
  const start = now()

  // eslint-disable-next-line fp/no-loops
  for (const context of contexts) {
    // eslint-disable-next-line no-await-in-loop
    await main.call(context)
  }

  return now() - start
}
