import { now } from './now.js'
import { getTimeResolution } from './resolution.js'
import { getResult, getMedian, sortNumbers, MAX_LOOPS } from './stats.js'

// Measure how long a task takes.
// Run the benchmark for a specific amount of time.
export const benchmark = async function(main, before, after, duration) {
  initialMeasure()

  const biasDuration = duration * BIAS_DURATION_RATIO
  const mainDuration = duration - biasDuration * 2

  const { nowBias, loopBias, minTime } = await getBiases(biasDuration)

  const result = await benchmarkMain(
    main,
    before,
    after,
    mainDuration,
    nowBias,
    loopBias,
    minTime,
  )
  return result
}

// For some reasons I ignore (likely engine optimizations), when `measure()`
// is benchmarking its first function, it's running much faster than for the
// next functions passed to it.
// We fix this by doing a cold start using an empty function
const initialMeasure = function() {
  measure(noopTwo, undefined, undefined, 0, 0, 1)
}

// eslint-disable-next-line no-empty-function
const noopTwo = function() {}

// Biases must be very precise to benchmark fast tasks accurately.
// So we dedicate a significant part of the total benchmark to them.
const BIAS_DURATION_RATIO = 0.1

// The following biases are introduced by the benchmarking code itself:
//   - `nowBias` is the time taken to retrieve the current timestamp
//   - `loopBias` is the time taken to iterate in a loop, when running a task
//     repeatedly, excluding the task itself.
// We remove those two biases from the calculated times.
// This function calculates those biases by benchmarking them.
// On top of this, the more the benchmarking code itself is run, the faster it
// is optimized. Calculating biases first performs a cold start so that the
// benchmarking code is already "hot" when we start the actual measurements.
const getBiases = async function(biasDuration) {
  const nowBias = await getNowBias(biasDuration)
  const minTime = getMinTime(nowBias)
  const loopBias = await getLoopBias(biasDuration, nowBias, minTime)
  return { nowBias, loopBias, minTime }
}

const getNowBias = async function(biasDuration) {
  const { times } = await benchmarkMain(
    noop,
    undefined,
    undefined,
    biasDuration,
    0,
    0,
    0,
    0,
  )
  const nowBias = getMedian(times)
  return nowBias
}

const getLoopBias = async function(biasDuration, nowBias, minTime) {
  const { times } = await benchmarkMain(
    noop,
    undefined,
    undefined,
    biasDuration,
    nowBias,
    0,
    minTime,
  )
  const loopBias = getMedian(times)
  return loopBias
}

// eslint-disable-next-line no-empty-function
const noop = function() {}

// If a task duration is too close to `nowBias`, the returned variance will be
// mostly due to the timestamp function itself.
// Also if a task duration is too close to the minimum system time resolution,
// it will lack precision.
// To fix this we run the task in a loop to increase its running time. We then
// perform an arithmetic mean.
// `minTime` is the minimum time under which we consider a task should do this.
const getMinTime = function(nowBias) {
  const minPrecisionTime = TIME_RESOLUTION * MIN_PRECISION
  const minNowBiasTime = nowBias * MIN_NOW_BIAS
  return Math.max(minPrecisionTime, minNowBiasTime)
}

const TIME_RESOLUTION = getTimeResolution()
// The task loop must be at least `MIN_PRECISION` slower than time resolution
const MIN_PRECISION = 1e2
// The task loop must be at least `MIN_NOW_BIAS` slower than `nowBias`
const MIN_NOW_BIAS = 1e2

const benchmarkMain = async function(
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

  const { times, count } = await benchmarkLoop(
    main,
    before,
    after,
    nowBias,
    loopBias,
    minTime,
    runEnd,
    constRepeat,
  )

  const result = getResult(times, count)
  return result
}

// We perform benchmarking iteratively in order to stop benchmarking exactly
// when the `duration` or `MAX_LOOPS` has been reached.
// We also adjust some parameters as we take more measurements (e.g. `repeat`).
// eslint-disable-next-line max-statements
const benchmarkLoop = async function(
  main,
  before,
  after,
  nowBias,
  loopBias,
  minTime,
  runEnd,
  constRepeat,
) {
  const times = []
  // eslint-disable-next-line fp/no-let
  let repeat = 0
  // eslint-disable-next-line fp/no-let
  let iterIndex = 1
  const count = { value: 0 }

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
    // eslint-disable-next-line fp/no-mutation
    repeat = getRepeat(
      repeat,
      times,
      iterIndex,
      count,
      minTime,
      loopBias,
      constRepeat,
    )

    // eslint-disable-next-line no-await-in-loop
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
    // eslint-disable-next-line fp/no-mutation
    iterIndex += 1
    // eslint-disable-next-line fp/no-mutation
    count.value += repeat
  } while (!shouldStop(runEnd, times))

  return { times, count: count.value }
}

const isPromiseLike = function(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    // eslint-disable-next-line promise/prefer-await-to-then
    typeof value.then === 'function'
  )
}

// The benchmark stops if we reach the end of the `duration` or run more than
// `MAX_LOOPS` iterations.
const shouldStop = function(runEnd, times) {
  return now() >= runEnd || times.length >= MAX_LOOPS
}

// Main measuring code. If `repeat` is specified, we perform an arithmetic mean.
const measure = async function(
  main,
  before,
  after,
  nowBias,
  loopBias,
  repeat,
  isAsync,
) {
  // When calculating `nowBias`
  if (repeat === 0) {
    return Math.abs(now() - now())
  }

  const beforeArgs = await performBefore(before, repeat)

  const duration = await getDuration(main, repeat, isAsync, beforeArgs)

  await performAfter(after, repeat, beforeArgs)

  // The final time might be negative if the task is as fast or faster than the
  // iteration code itself. In this case, we return `0`.
  const time = Math.max((duration - nowBias) / repeat - loopBias, 0)
  return time
}

const performBefore = function(before, repeat) {
  if (before === undefined) {
    return
  }

  const beforeArgs = Array.from({ length: repeat }, () => before())
  return Promise.all(beforeArgs)
}

const performAfter = function(after, repeat, beforeArgs = []) {
  if (after === undefined) {
    return
  }

  const promises = Array.from({ length: repeat }, (value, index) =>
    after(beforeArgs[index]),
  )
  return Promise.all(promises)
}

// We separate async and sync measurements because following a promise (`await`)
// takes several microseconds, which does not work when measuring fast
// synchronous functions.
// For the same reasons, we have different functions depending on whether
// `beforeArgs` is used because passing an argument to `main()` is slightly
// slower.
const getDuration = function(main, repeat, isAsync, beforeArgs) {
  if (isAsync) {
    return getDurationAsync(main, repeat, beforeArgs)
  }

  return getDurationSync(main, repeat, beforeArgs)
}

const getDurationAsync = function(main, repeat, beforeArgs) {
  if (beforeArgs !== undefined) {
    return getDurationArgsAsync(main, repeat, beforeArgs)
  }

  return getDurationNoArgsAsync(main, repeat)
}

const getDurationSync = function(main, repeat, beforeArgs) {
  if (beforeArgs !== undefined) {
    return getDurationArgsSync(main, repeat, beforeArgs)
  }

  return getDurationNoArgsSync(main, repeat)
}

const getDurationArgsAsync = async function(main, repeat, beforeArgs) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    // eslint-disable-next-line no-await-in-loop
    await main(beforeArgs[repeat])
  }

  return now() - start
}

const getDurationNoArgsAsync = async function(main, repeat) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    // eslint-disable-next-line no-await-in-loop
    await main()
  }

  return now() - start
}

const getDurationArgsSync = function(main, repeat, beforeArgs) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    main(beforeArgs[repeat])
  }

  return now() - start
}

const getDurationNoArgsSync = function(main, repeat) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    main()
  }

  return now() - start
}

// Estimate how many times to repeat the benchmarking loop.
// This is performed continuously based on the previous benchmarked times
// because fast functions get optimized by JavaScript engines after they are
// run several times in a row ("hot paths"). Those number of times are several
// specific thresholds. When this happens, `repeat` needs to be computed again.
const getRepeat = function(
  repeat,
  times,
  iterIndex,
  count,
  minTime,
  loopBias,
  constRepeat,
) {
  // `constRepeat` is used during bias calculation to set a fixed `repeat` value
  if (constRepeat !== undefined) {
    return constRepeat
  }

  // This is performed logarithmatically (on iteration number 1, 2, 4, 8, etc.)
  // because `array.sort()` is slow: O(n log(n))
  if (!Number.isInteger(Math.log2(iterIndex))) {
    return repeat
  }

  // First iteration
  if (repeat === 0) {
    return 1
  }

  const nextRepeat = computeRepeat(repeat, times, minTime, loopBias)
  callibrateRepeat(nextRepeat, repeat, times, count)
  return nextRepeat
}

// `repeat` is adjusted so that `measure()` time === `minTime`
const computeRepeat = function(repeat, times, minTime, loopBias) {
  sortNumbers(times)
  const median = getMedian(times)

  // When calculating `loopBias`, `median` might initially be `0`
  if (loopBias === 0 && median === 0) {
    return repeat * 2
  }

  return Math.ceil(minTime / (median + loopBias))
}

// When `repeat` changes too much, we discard previously computed times.
// This is because mixing times computed with different `repeat` is bad.
// Different `repeat` give different times due to bias correction and JavaScript
// engine loop optimizations.
// However `repeat` always eventually stabilizes.
const callibrateRepeat = function(nextRepeat, repeat, times, count) {
  if (Math.abs(nextRepeat - repeat) / repeat <= MIN_REPEAT_DIFF) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  times.splice(0)
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  count.value = 0
}

const MIN_REPEAT_DIFF = 0.1
