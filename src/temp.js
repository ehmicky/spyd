import { now } from './now.js'
import { getTimeResolution } from './resolution.js'

// The following biases are introduced by the benchmarking code itself:
//   - `nowBias` is the time taken to retrieve the current timestamp
//   - `loopBias` is the time taken to iterate in a loop, when running a task
//     repeatedly, excluding the task itself.
// We remove those two biases from the calculated times.
// This function calculates those biases by benchmarking them.
// Biases calculation does not account into the spent `duration`.
// On top of this, the more the benchmarking code itself is run, the faster it
// is optimized. Calculating biases first performs a cold start so that the
// benchmarking code is already "hot" when we start the actual measurements.
export const getBiases = function(duration) {
  initialMeasure()

  const biasDuration = Math.max(
    MIN_BIAS_DURATION,
    duration / BIAS_DURATION_RATIO,
  )
  const nowBias = benchmark(noop, biasDuration, 0, 0, 0, 0)
  const minTime = getMinTime(nowBias)
  const loopBias = benchmark(noop, biasDuration, nowBias, 0, minTime)
  return { nowBias, loopBias, minTime }
}

const noop = function() {}

// For some reasons I ignore (likely engine optimizations), when `measure()`
// is benchmarking its first function, it's running much faster than for the
// next functions passed to it.
// We fix this by doing a cold start using an empty function
const initialMeasure = function() {
  measure(noopTwo, 0, 0, 1)
}

const noopTwo = function() {}

// TODO: Min good biasDuration for nowBias: 5e7 - 1e8
// TODO: Min good biasDuration for loopBias: 5e6 - 1e7
// Biases must be very precise to benchmark fast tasks accurately.
// So we impose a minimum duration when calculating them.
const MIN_BIAS_DURATION = 5e6
// However if the duration is high enough, we spend even more time calculating
// biases.
const BIAS_DURATION_RATIO = 1e2

// If a task duration is too close to `nowBias, the returned variance will be
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

// Entry point of the main benchmarking logic
export const benchmark = function(
  main,
  duration,
  nowBias,
  loopBias,
  minTime,
  constRepeat,
) {
  const runEnd = now() + duration

  const times = benchmarkLoop(
    main,
    nowBias,
    loopBias,
    minTime,
    runEnd,
    constRepeat,
  )

  const median = getMedian(times)
  return median
}

// We perform benchmarking incrementally/recursively in order to:
//  - stop benchmarking exactly when the `duration` has been reached
//  - adjust some parameters as we take more measurements (e.g. `repeat`)
//  - reduce the sample size when we hit the max memory limit
const benchmarkLoop = function(
  main,
  nowBias,
  loopBias,
  minTime,
  runEnd,
  constRepeat,
) {
  const times = []

  // eslint-disable-next-line fp/no-let
  let repeat = constRepeat === undefined ? 1 : constRepeat
  const callibration = { done: false }

  // Due to some JavaScript engine optimization, the first run of a function is
  // much slower than the next calls. For example running an empty function
  // might be 1000 times slower on the first call. So we do a cold start.
  main()

  // eslint-disable-next-line fp/no-loops
  do {
    const time = measure(main, nowBias, loopBias, repeat)

    sortedInsert(times, time)

    // eslint-disable-next-line fp/no-mutation
    repeat = getRepeat(
      times,
      minTime,
      loopBias,
      constRepeat,
      repeat,
      callibration,
    )
    // Until we reach the end of the `duration`
  } while (now() < runEnd)

  return times
}

// Main measuring code. If `repeat` is specified, we perform an arithmetic mean.
const measure = function(main, nowBias, loopBias, repeat) {
  // When calculating `nowBias`
  if (repeat === 0) {
    return Math.abs(now() - now())
  }

  // eslint-disable-next-line fp/no-let
  let count = repeat
  const start = now()

  // We use a while loop for speed purpose.
  // eslint-disable-next-line no-plusplus, fp/no-mutation, fp/no-loops
  while (count--) {
    main()
  }

  const end = now()
  // The final time might be negative if the task is as fast or faster than the
  // iteration code itself. In this case, we return `0`.
  const time = Math.max((end - start - nowBias) / repeat - loopBias, 0)
  return time
}

// Insert a value into a sorted array.
// We need the times to always be sorted since each iteration needs to retrieve
// the median (to compute `repeat`). Doing sorting incrementally is much better
// as it only requires O(log n) of time complexity and O(1) of space complexity.
const sortedInsert = function(array, value) {
  // eslint-disable-next-line fp/no-let
  let start = 0
  // eslint-disable-next-line fp/no-let
  let end = array.length

  // eslint-disable-next-line fp/no-loops
  while (start < end) {
    const middle = Math.floor((start + end) / 2)

    // eslint-disable-next-line max-depth
    if (array[middle] < value) {
      // eslint-disable-next-line fp/no-mutation
      start = middle + 1
    } else {
      // eslint-disable-next-line fp/no-mutation
      end = middle
    }
  }

  // eslint-disable-next-line fp/no-mutating-methods
  array.splice(start, 0, value)
}

// Estimate how many times to repeat the benchmarking loop.
// This is performed continuously based on the previous benchmarked times.
const getRepeat = function(
  times,
  minTime,
  loopBias,
  constRepeat,
  previousRepeat,
  callibration,
) {
  const repeat = computeRepeat(
    times,
    minTime,
    loopBias,
    constRepeat,
    previousRepeat,
  )
  callibrateRepeat(callibration, times, repeat, previousRepeat)
  return repeat
}

const computeRepeat = function(
  times,
  minTime,
  loopBias,
  constRepeat,
  previousRepeat,
) {
  // `constRepeat` is used during bias calculation to set a fixed `repeat` value
  if (constRepeat !== undefined) {
    return constRepeat
  }

  const median = getMedian(times)

  // When calculating `loopBias`, `median` might initially be `0`
  if (loopBias === 0 && median === 0) {
    return previousRepeat * 2
  }

  const repeat = Math.ceil(minTime / (median + loopBias))
  return repeat
}

// `repeat` initially varies greatly but quickly stabilitizes. Once this
// happens, we only keep 2/3 median times and discard the others.
// This is because mixing times computed with different `repeat` is bad.
// Different `repeat` give different times due to bias correction and JavaScript
// engine loop optimizations.
// After stabilizing `repeat` does not change enough to impact statistical
// significance anymore.
// When `repeat` is not used (always `1`), no times are discarded.
const callibrateRepeat = function(callibration, times, repeat, previousRepeat) {
  // When two successive `repeat` are the same, we consider they have stabilized
  if (callibration.done || repeat !== previousRepeat) {
    return
  }

  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  callibration.done = true

  const newTimes = getMedianRange(times)
  // eslint-disable-next-line fp/no-mutating-methods
  times.splice(0, times.length, ...newTimes)
}

// Retrieve median of a sorted array
const getMedian = function(array) {
  if (array.length % 2 === 1) {
    return array[(array.length - 1) / 2]
  }

  return (array[array.length / 2 - 1] + array[array.length / 2]) / 2
}

// Retrieve 2/3 elements at the median of a sorted array
const getMedianRange = function(array) {
  if (array.length <= 1) {
    return array
  }

  if (array.length % 2 === 0) {
    return [array[array.length / 2 - 1], array[array.length / 2]]
  }

  return [
    array[(array.length - 1) / 2 - 1],
    array[(array.length - 1) / 2],
    array[(array.length - 1) / 2 + 1],
  ]
}
