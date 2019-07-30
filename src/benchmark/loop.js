import { now } from '../now.js'
import { normalizeResult, MAX_LOOPS } from '../stats/main.js'
import { isPromiseLike } from '../utils.js'

import { measure } from './measure.js'
import { handleRepeat } from './repeat.js'

// We perform benchmarking iteratively in order to stop benchmarking exactly
// when the `duration` or `MAX_LOOPS` has been reached.
// We also adjust some parameters as we take more measurements (e.g. `repeat`).
export const benchmarkLoop = async function(
  main,
  before,
  after,
  duration,
  nowBias,
  loopBias,
  minTime,
  constRepeat,
) {
  const runEnd = now() + duration
  const times = []
  const state = { repeat: 0, count: 0, iterIndex: 1 }

  // Due to some JavaScript engine optimization, the first run of a function is
  // much slower than the next calls. For example running an empty function
  // might be 1000 times slower on the first call. So we do a cold start.
  const returnValue = main()
  // We only check once if `main()` is async in order to simplify the logic.
  // This means `main()` cannot be sometimes sync and other times async.
  // This does not apply to `before()` nor `after()`.
  const isAsync = isPromiseLike(returnValue)

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
      constRepeat,
      times,
      state,
      isAsync,
    )
  } while (!shouldStop(runEnd, times))

  const result = normalizeResult(times, state.count)
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
  constRepeat,
  times,
  state,
  isAsync,
) {
  const repeat = handleRepeat(state, times, minTime, loopBias, constRepeat)

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
  times.push(time)

  // eslint-disable-next-line no-param-reassign, fp/no-mutation, require-atomic-updates
  state.iterIndex += 1
}

// The benchmark stops if we reach the end of the `duration` or run more than
// `MAX_LOOPS` iterations.
const shouldStop = function(runEnd, times) {
  return now() >= runEnd || times.length >= MAX_LOOPS
}
