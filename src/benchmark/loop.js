import { now } from '../now.js'
import { normalizeResult, MAX_LOOPS } from '../stats/normalize.js'

import { measure } from './measure.js'
import { getRepeat } from './repeat.js'
import { updateState } from './state.js'

// We perform benchmarking iteratively in order to stop benchmarking exactly
// when the `duration` or `MAX_LOOPS` has been reached.
// We also adjust some parameters as we take more measurements (e.g. `repeat`).
export const benchmarkLoop = async function(
  main,
  before,
  after,
  duration,
  isAsync,
  nowBias,
  loopBias,
  minTime,
) {
  const runEnd = now() + duration
  const state = { times: [], repeat: 1, count: 0, iterIndex: 0 }

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    await benchmarkIteration(
      main,
      before,
      after,
      duration,
      nowBias,
      loopBias,
      minTime,
      state,
      isAsync,
    )
  } while (!shouldStop(runEnd, state.times))

  const result = normalizeResult(state.times, state.count)
  return result
}

const benchmarkIteration = async function(
  main,
  before,
  after,
  duration,
  nowBias,
  loopBias,
  minTime,
  state,
  isAsync,
) {
  const repeat = getRepeat({ main, state, minTime, loopBias })

  updateState(state, repeat)

  const time = await measure(
    main,
    before,
    after,
    nowBias,
    loopBias,
    repeat,
    isAsync,
  )
  // eslint-disable-next-line fp/no-mutating-methods
  state.times.push(time)
}

// The benchmark stops if we reach the end of the `duration` or run more than
// `MAX_LOOPS` iterations.
const shouldStop = function(runEnd, times) {
  return now() >= runEnd || times.length >= MAX_LOOPS
}
