import { performLoopsAsync } from './async.js'
import { performLoopsSync } from './sync.js'

// Call the `main` function iteratively and return an array of numbers measuring
// how long each call took.
// We separate async and sync measurements because following a promise (`await`)
// can take several microseconds, which does not work when measuring fast
// synchronous functions.
export const measure = async function (
  { repeat, maxLoops },
  { task: { main, beforeEach, afterEach, async }, taskArg },
) {
  const measures = []
  const performLoopsFunc = async ? performLoopsAsync : performLoopsSync
  await performLoopsFunc({
    main,
    beforeEach,
    afterEach,
    taskArg,
    repeat,
    maxLoops,
    measures,
  })
  return { measures }
}
