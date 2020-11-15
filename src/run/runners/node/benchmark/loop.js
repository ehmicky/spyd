import now from 'precise-now'

import { measure } from './measure.js'
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
  async,
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
      async,
    })
  } while (now() < runEnd)

  return { times: state.times, count: state.count }
}

const benchmarkIteration = async function ({
  main,
  before,
  after,
  nowBias,
  loopBias,
  minTime,
  state,
  async,
}) {
  const repeat = getRepeat({ state, nowBias, loopBias, minTime })

  const time = await measure({
    main,
    before,
    after,
    nowBias,
    loopBias,
    repeat,
    async,
  })

  const stateA = updateState(state, time, repeat)
  return stateA
}
