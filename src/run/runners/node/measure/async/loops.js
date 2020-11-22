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
}) {
  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutating-methods, no-await-in-loop
    measures.push(await performLoopAsync({ main, before, after, repeat }))
  } while (!shouldStopMeasuring(measureEnd))
}

const performLoopAsync = async function ({ main, before, after, repeat }) {
  const beforeArgs = await performBeforeAsync(before, repeat)
  const duration = await getDurationAsync(main, repeat, beforeArgs)
  await performAfterAsync(after, repeat, beforeArgs)
  return duration
}
