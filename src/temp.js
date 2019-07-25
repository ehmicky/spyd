import { now } from './now.js'
import { getTimeResolution } from './resolution.js'

// The following biases are introduced by the benchmarking code itself:
//   - `nowBias` is the time taken to retrieve the current timestamp
//   - `loopBias` is the time taken to iterate in a loop, when running a task
//     repeatedly, excluding the task itself.
// We remove those two biases from the calculated times.
// This function calculates those biases by benchmarking them.
// Biases calculation does not account into the spent `duration`.
export const getBiases = function(duration) {
  const biasDuration = Math.max(
    MIN_BIAS_DURATION,
    duration / BIAS_DURATION_RATIO,
  )
  const nowBias = getMedian(now, biasDuration, 0, 0, 0, NOW_BIAS_REPEAT)
  const loopBias = getMedian(noop, biasDuration, 0, 0, 0, LOOP_BIAS_REPEAT)
  const minTime = getMinTime(nowBias)
  return { nowBias, loopBias, minTime }
}

const noop = function() {}

// Biases must be very precise to benchmark fast tasks accurately.
// So we impose a minimum duration when calculating them.
const MIN_BIAS_DURATION = 1e8
// However if the duration is high enough, we spend even more time calculating
// biases.
const BIAS_DURATION_RATIO = 1e2

// Hard-code the number of `repeat` when calculating biases
const NOW_BIAS_REPEAT = 1e3
const LOOP_BIAS_REPEAT = 1e4

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
export const getMedian = function(
  main,
  duration,
  nowBias,
  loopBias,
  minTime,
  constRepeat,
) {
  const runEnd = now() + duration
  const initialRepeat = constRepeat === undefined ? 1 : constRepeat
  return recursiveMedian(
    main,
    nowBias,
    loopBias,
    initialRepeat,
    constRepeat,
    minTime,
    runEnd,
    measure,
    0,
    true,
  )
}

// We perform benchmarking incrementally/recursively in order to:
//  - stop benchmarking exactly when the `duration` has been reached
//  - adjust some parameters as we take more measurements (e.g. `repeat`)
//  - reduce the sample size when we hit the max memory limit
// eslint-disable-next-line max-statements, max-lines-per-function
const recursiveMedian = function(
  main,
  nowBias,
  loopBias,
  repeat,
  constRepeat,
  minTime,
  runEnd,
  measureTime,
  depth,
  recurse,
  timeA = measureTime(main, nowBias, loopBias, repeat),
) {
  // We've reached the end of the `duration`
  if (now() > runEnd) {
    return timeA
  }

  const timeB = measureTime(main, nowBias, loopBias, repeat)
  const timeC = measureTime(main, nowBias, loopBias, repeat)
  const median = medianOfThree(timeA, timeB, timeC)

  if (!recurse) {
    return median
  }

  const nextRepeat = getRepeat(median, minTime, constRepeat)
  const nextMedian = getNextMedian(repeat, nextRepeat, median)

  // Recurse but pass itself as the next `measureTime()`, which means the next
  // recursion will be three times slower and more precise.
  const recursiveGetTime = (main, nowBias, loopBias, repeat) =>
    recursiveMedian(
      main,
      nowBias,
      loopBias,
      repeat,
      constRepeat,
      minTime,
      runEnd,
      measureTime,
      depth,
      false,
    )

  return recursiveMedian(
    main,
    nowBias,
    loopBias,
    nextRepeat,
    constRepeat,
    minTime,
    runEnd,
    recursiveGetTime,
    depth + 1,
    true,
    nextMedian,
  )
}

// Main measuring code. If `repeat` is specified, we perform an arithmetic mean.
const measure = function(main, nowBias, loopBias, repeat) {
  // eslint-disable-next-line fp/no-let
  let count = repeat
  const start = now()

  // We use a do/while loop for speed purpose.
  // eslint-disable-next-line fp/no-loops
  do {
    main()
    // eslint-disable-next-line no-plusplus, fp/no-mutation
  } while (--count)

  const end = now()
  // The final time might be negative if the task is as fast or faster than the
  // iteration code itself. In this case, we return `0`.
  return Math.max((end - start - nowBias) / repeat - loopBias, 0)
}

// Estimate how many times to repeat the benchmarking loop.
const getRepeat = function(median, minTime, constRepeat) {
  // `constRepeat` is used during bias calculation to set a fixed `repeat` value
  if (constRepeat !== undefined) {
    return constRepeat
  }

  if (median === 0) {
    return 1
  }

  return Math.ceil(minTime / median)
}

// We should not mix times that have been computed with different `repeat`.
// This is because different `repeat` give different times due to bias
// correction and JavaScript engine loop optimizations.
// So if the `repeat` changes too much, we discard the previously computed
// times.
// However, once stabilized, `repeat` will slightly vary. Those slight changes
// should not discard the previously computed times.
// When `repeat` change is low though, this should not impact the computed times
// too much, so we do not need to discard them.
const getNextMedian = function(repeat, nextRepeat, median) {
  const repeatDiff = Math.abs(nextRepeat - repeat) / repeat

  if (repeatDiff >= MIN_REPEAT_DIFF) {
    return
  }

  return median
}

const MIN_REPEAT_DIFF = 0.1

// We use a median instead of an arithmetic mean in order to exclude outliers
// and increase precision.
// We purposely use nested `if`, avoid destructuring and do not use nested
// function calls for performance reasons.
// eslint-disable-next-line max-statements, complexity
const medianOfThree = function(valueA, valueB, valueC) {
  if (valueA < valueB) {
    // eslint-disable-next-line max-depth
    if (valueB < valueC) {
      return valueB
    }

    // eslint-disable-next-line max-depth
    if (valueA < valueC) {
      return valueC
    }

    return valueA
  }

  if (valueA < valueC) {
    return valueA
  }

  if (valueB < valueC) {
    return valueC
  }

  return valueB
}
