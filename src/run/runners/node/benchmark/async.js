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
  // eslint-disable-next-line fp/no-let
  let contexts = getContexts(repeat)

  // eslint-disable-next-line fp/no-loops
  while (mainMeasures.length < maxLoops) {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    contexts = await performLoopAsync({
      main,
      beforeEach,
      afterEach,
      repeat,
      contexts,
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
  contexts,
  mainMeasures,
  emptyMeasures,
}) {
  addEmptyMeasure(emptyMeasures)

  const contextsA = getContexts(repeat, contexts)
  await performHookAsync(beforeEach, contextsA)
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(await getDurationAsync(main, contextsA))
  await performHookAsync(afterEach, contextsA)
  return contextsA
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
