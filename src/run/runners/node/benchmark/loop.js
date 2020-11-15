import now from 'precise-now'

import { measure } from './measure.js'
import { normalizeResult } from './normalize.js'
import { getRepeat } from './repeat.js'
import { updateState } from './state.js'

// We perform benchmarking iteratively in order to stop benchmarking exactly
// when the `duration` has been reached.
// We also adjust or increment some `state` variables as we take more
// measurements.
// We ensure `times` contains at least one measurement.
export const benchmarkLoop = async function ({
  main,
  before,
  after,
  duration,
  isAsync,
  nowBias,
  loopBias,
  minTime,
}) {
  const runEnd = now() + duration
  // eslint-disable-next-line fp/no-let
  let state = { times: [], repeat: 1, count: 0, iterIndex: 0 }

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    state = await benchmarkIteration({
      main,
      before,
      after,
      nowBias,
      loopBias,
      minTime,
      state,
      isAsync,
    })
  } while (now() < runEnd)

  const result = normalizeResult(state.times, state.count)
  return result
}

const benchmarkIteration = async function ({
  main,
  before,
  after,
  nowBias,
  loopBias,
  minTime,
  state,
  isAsync,
}) {
  const repeat = getRepeat({ main, state, minTime, loopBias })

  const time = await measure({
    main,
    before,
    after,
    nowBias,
    loopBias,
    repeat,
    isAsync,
  })

  const stateA = updateState(state, time, repeat)
  return stateA
}
