import { addEmptyMeasure } from '../empty.js'

import { performBeforeAsync, performAfterAsync } from './before_after.js'
import { getDurationAsync } from './duration.js'

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

  const beforeArgs = await performBeforeAsync(beforeEach, repeat)
  // eslint-disable-next-line fp/no-mutating-methods
  mainMeasures.push(await getDurationAsync(main, repeat, beforeArgs))
  await performAfterAsync(afterEach, repeat, beforeArgs)
}
