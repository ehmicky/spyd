import { startMeasuring } from '../../common/start.js'

import { performLoopsAsync } from './async/loops.js'
import { performLoopsSync } from './sync/loops.js'

// Call the `main` function iteratively and return an array of numbers measuring
// how long each call took.
export const measureTask = async function ({
  main,
  before,
  after,
  async,
  repeat,
  maxDuration,
}) {
  const { measures, start, measureEnd } = startMeasuring(maxDuration)
  await performLoops({
    main,
    before,
    after,
    async,
    repeat,
    measureEnd,
    measures,
  })
  return { measures, start }
}

// We separate async and sync measurements because following a promise (`await`)
// can take several microseconds, which does not work when measuring fast
// synchronous functions.
const performLoops = function ({
  main,
  before,
  after,
  async,
  repeat,
  measureEnd,
  measures,
}) {
  if (async) {
    return performLoopsAsync({
      main,
      before,
      after,
      repeat,
      measureEnd,
      measures,
    })
  }

  return performLoopsSync({ main, before, after, repeat, measureEnd, measures })
}
