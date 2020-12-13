import { addEmptyMeasure } from '../empty.js'
import { shouldStopMeasuring } from '../stop.js'

import { performBeforeSync, performAfterSync } from './before_after.js'
import { getDurationSync } from './duration.js'

// Perform measuring loops iteratively
export const performLoopsSync = function ({
  main,
  before,
  after,
  repeat,
  measureEnd,
  measures,
  emptyMeasures,
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    performLoopSync({ main, before, after, repeat, measures, emptyMeasures })
  } while (!shouldStopMeasuring(measureEnd))
}

const performLoopSync = function ({
  main,
  before,
  after,
  repeat,
  measures,
  emptyMeasures,
}) {
  addEmptyMeasure(emptyMeasures)

  const beforeArgs = performBeforeSync(before, repeat)
  // eslint-disable-next-line fp/no-mutating-methods
  measures.push(getDurationSync(main, repeat, beforeArgs))
  performAfterSync(after, repeat, beforeArgs)
}
