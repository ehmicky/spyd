import now from 'precise-now'

import { getContexts } from './context.js'
import { addEmptyMeasure } from './empty.js'

// Perform measuring loops iteratively
export const performLoopsSync = function ({
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
    performLoopSync({
      main,
      beforeEach,
      afterEach,
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
  repeat,
  mainMeasures,
  emptyMeasures,
}) {
  addEmptyMeasure(emptyMeasures)

  const contexts = getContexts(repeat)
  performHookSync(beforeEach, contexts)
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(getDurationSync(main, contexts))
  performHookSync(afterEach, contexts)
}

// Task `beforeEach()`/`afterEach()`. Performed outside measurements.
// `beforeEach`, `main` and `afterEach` should communicate using context objects
const performHookSync = function (hook, contexts) {
  if (hook === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops
  for (const context of contexts) {
    hook.call(context)
  }
}

const getDurationSync = function (main, contexts) {
  const start = now()

  // eslint-disable-next-line fp/no-loops
  for (const context of contexts) {
    main.call(context)
  }

  return now() - start
}
