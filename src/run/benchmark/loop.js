import { now } from '../../now.js'

import { measure } from './measure.js'
import { getRepeat } from './repeat.js'
import { updateState } from './state.js'
import { normalizeResult, OUTLIERS_THRESHOLD } from './normalize.js'

// We perform benchmarking iteratively in order to stop benchmarking exactly
// when the `duration` or `MAX_LOOPS` has been reached.
// We also adjust or increment some `state` variables as we take more
// measurements.
export const benchmarkLoop = async function({
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
  } while (!shouldStop(runEnd, state.times))

  const result = normalizeResult(state.times, state.count)
  return result
}

const benchmarkIteration = async function({
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

// The benchmark stops if either:
//  - we reach the end of the `duration`
//  - we run more than `MAX_LOOPS` iterations
const shouldStop = function(runEnd, times) {
  return now() >= runEnd || times.length >= MAX_LOOPS
}

// We limit the max number of iterations because:
//  - the more iterations are run, the more JavaScript engines optimize it,
//    making code run faster and faster. This results in higher variance.
//    This is especially true for very fast functions.
//  - after many iterations have been run, the precision does not increase much
//    anymore. The extra `duration` should instead be spent launching more child
//    processes which are more effective at increasing precision.
//  - this prevents hitting the process maximum memory limit.
// This number if corrected by `OUTLITERS_THRESHOLD` so the final `loops` looks
// round after removing outliers.
const RAW_MAX_LOOPS = 1e5
const MAX_LOOPS = Math.floor(RAW_MAX_LOOPS / (1 - OUTLIERS_THRESHOLD))
