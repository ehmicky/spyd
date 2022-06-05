import { TasksRunError } from '../../../common/error.js'

import { performLoopsAsync } from './async.js'
import { performLoopsSync } from './sync.js'

// Call the `main` function iteratively and return an array of numbers measuring
// how long each call took.
// We separate async and sync measurements because following a promise (`await`)
// can take several microseconds, which does not work when measuring fast
// synchronous functions.
export const measure = async function (
  { task: { main, beforeEach, afterEach, async }, inputs },
  { repeat, maxLoops },
) {
  try {
    const measures = async
      ? await performLoopsAsync({
          main,
          beforeEach,
          afterEach,
          inputs,
          repeat,
          maxLoops,
        })
      : performLoopsSync({
          main,
          beforeEach,
          afterEach,
          inputs,
          repeat,
          maxLoops,
        })
    return { measures }
  } catch (cause) {
    throw new TasksRunError('', { cause })
  }
}
