import { addEmptyMeasure } from '../empty.js'
import { shouldStopMeasuring } from '../stop.js'

import { performBeforeAsync, performAfterAsync } from './before_after.js'
import { getDurationAsync } from './duration.js'

export const performLoopsAsync = async function ({
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
    // eslint-disable-next-line no-await-in-loop
    await performLoopAsync({
      main,
      before,
      after,
      repeat,
      measures,
      emptyMeasures,
    })
  } while (!shouldStopMeasuring(measureEnd))
}

const performLoopAsync = async function ({
  main,
  before,
  after,
  repeat,
  measures,
  emptyMeasures,
}) {
  addEmptyMeasure(emptyMeasures)

  const beforeArgs = await performBeforeAsync(before, repeat)
  // eslint-disable-next-line fp/no-mutating-methods
  measures.push(await getDurationAsync(main, repeat, beforeArgs))
  await performAfterAsync(after, repeat, beforeArgs)
}
