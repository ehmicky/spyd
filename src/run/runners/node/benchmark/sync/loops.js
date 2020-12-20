import { addEmptyMeasure } from '../empty.js'

import { performBeforeSync, performAfterSync } from './before_after.js'
import { getDurationSync } from './duration.js'

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

  const beforeArgs = performBeforeSync(beforeEach, repeat)
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(getDurationSync(main, repeat, beforeArgs))
  performAfterSync(afterEach, repeat, beforeArgs)
}
