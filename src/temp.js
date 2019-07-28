import { now } from './now.js'
import { getTimeResolution } from './resolution.js'

// Measure how long a task takes.
// Run the benchmark for a specific amount of time.
export const benchmark = function(main, duration) {
  initialMeasure()

  const biasDuration = duration * BIAS_DURATION_RATIO
  const mainDuration = duration - biasDuration * 2

  const { nowBias, loopBias, minTime } = getBiases(biasDuration)

  const stats = benchmarkMain(main, mainDuration, nowBias, loopBias, minTime)
  return stats
}

// For some reasons I ignore (likely engine optimizations), when `measure()`
// is benchmarking its first function, it's running much faster than for the
// next functions passed to it.
// We fix this by doing a cold start using an empty function
const initialMeasure = function() {
  measure(noopTwo, 0, 0, 1)
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
// Biases calculation does not account into the spent `duration`.
// On top of this, the more the benchmarking code itself is run, the faster it
// is optimized. Calculating biases first performs a cold start so that the
// benchmarking code is already "hot" when we start the actual measurements.
const getBiases = function(biasDuration) {
  const { median: nowBias } = benchmarkMain(noop, biasDuration, 0, 0, 0, 0)
  const minTime = getMinTime(nowBias)
  const { median: loopBias } = benchmarkMain(
    noop,
    biasDuration,
    nowBias,
    0,
    minTime,
  )
  return { nowBias, loopBias, minTime }
}

// eslint-disable-next-line no-empty-function
const noop = function() {}

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

const benchmarkMain = function(
  main,
  duration,
  nowBias,
  loopBias,
  minTime,
  constRepeat,
) {
  const runEnd = now() + duration

  const { times, count } = benchmarkLoop(
    main,
    nowBias,
    loopBias,
    minTime,
    runEnd,
    constRepeat,
  )

  const stats = getStats(times, count)
  return stats
}

// We perform benchmarking incrementally in order to:
//  - stop benchmarking exactly when the `duration` has been reached
//  - adjust some parameters as we take more measurements (e.g. `repeat`)
//  - reduce the sample size when we hit the max memory limit
// eslint-disable-next-line max-statements
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
  let repeat = 0
  // eslint-disable-next-line fp/no-let
  let iterIndex = 1
  const count = { value: 0 }

  // Due to some JavaScript engine optimization, the first run of a function is
  // much slower than the next calls. For example running an empty function
  // might be 1000 times slower on the first call. So we do a cold start.
  main()

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

    const time = measure(main, nowBias, loopBias, repeat)

    // eslint-disable-next-line fp/no-mutating-methods
    times.push(time)
    // eslint-disable-next-line fp/no-mutation
    iterIndex += 1
    // eslint-disable-next-line fp/no-mutation
    count.value += repeat
    // Until we reach the end of the `duration`
  } while (now() < runEnd)

  return { times, count: count.value }
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

const sortNumbers = function(array) {
  // eslint-disable-next-line fp/no-mutating-methods
  array.sort(compareNumbers)
}

const compareNumbers = function(numA, numB) {
  return numA > numB ? 1 : -1
}

const getStats = function(array, count) {
  sortNumbers(array)

  const loops = array.length
  const repeat = Math.round(count / loops)

  const median = getMedian(array)

  const [min] = array
  const max = array[array.length - 1]

  const mean = getMean(array)
  const variance = getVariance(array, mean)
  const deviation = getDeviation(variance)

  return { median, mean, min, max, deviation, variance, loops, count, repeat }
}

// Retrieve median of a sorted array
const getMedian = function(array) {
  if (array.length % 2 === 1) {
    return array[(array.length - 1) / 2]
  }

  return (array[array.length / 2 - 1] + array[array.length / 2]) / 2
}

const getDeviation = function(variance) {
  return Math.sqrt(variance)
}

const getMean = function(array) {
  return array.reduce(addNumbers) / array.length
}

const addNumbers = function(numA, numB) {
  return numA + numB
}

const getVariance = function(array, mean) {
  return getMean(array.map(num => (num - mean) ** 2))
}
