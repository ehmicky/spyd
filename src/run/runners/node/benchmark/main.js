import { startMeasuring } from '../../common/start.js'

import { performLoopsAsync } from './async/loops.js'
import { performLoopsSync } from './sync/loops.js'

// Call the `main` function iteratively and return an array of numbers measuring
// how long each call took.
// We separate async and sync measurements because following a promise (`await`)
// can take several microseconds, which does not work when measuring fast
// synchronous functions.
export const benchmark = async function (
  { repeat, maxLoops, empty },
  { main, before, after, async },
) {
  const { mainMeasures, emptyMeasures } = startMeasuring(empty)
  const performLoopsFunc = async ? performLoopsAsync : performLoopsSync
  await performLoopsFunc({
    main,
    before,
    after,
    repeat,
    maxLoops,
    mainMeasures,
    emptyMeasures,
  })
  return { mainMeasures, emptyMeasures }
}
