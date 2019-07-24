import { now } from './now.js'
import { getTimeResolution } from './resolution.js'

export const getBiases = function(duration) {
  const biasDuration = Math.max(
    MIN_BIAS_DURATION,
    duration / BIAS_DURATION_RATIO,
  )
  const nowBias = getMedian(now, biasDuration, 0, 0, NOW_BIAS_REPEAT)
  const loopBias = getMedian(noop, biasDuration, 0, 0, LOOP_BIAS_REPEAT)
  return { nowBias, loopBias }
}

const noop = function() {}

const MIN_BIAS_DURATION = 1e8
const BIAS_DURATION_RATIO = 1e2
const NOW_BIAS_REPEAT = 1e3
const LOOP_BIAS_REPEAT = 1e4

export const getMedian = function(
  main,
  duration,
  nowBias,
  loopBias,
  constRepeat,
) {
  const runEnd = now() + duration
  const minTime = getMinTime(nowBias)
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

const getMinTime = function(nowBias) {
  const minPrecisionTime = TIME_RESOLUTION * MIN_PRECISION
  const minNowBiasTime = nowBias * MIN_NOW_BIAS
  return Math.max(minPrecisionTime, minNowBiasTime)
}

const TIME_RESOLUTION = getTimeResolution()
const MIN_PRECISION = 1e2
const MIN_NOW_BIAS = 1e2

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
  return Math.max((end - start - nowBias) / repeat - loopBias, 0)
}

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

const getRepeat = function(median, minTime, constRepeat) {
  if (constRepeat !== undefined) {
    return constRepeat
  }

  if (median === 0) {
    return 1
  }

  return Math.ceil(minTime / median)
}

// We should not mix medians that have been computed with different `repeat`.
// This is because different `repeat` give different medians due to bias
// correction and JavaScript engine loop optimizations.
// So if the `repeat` changes too much, we discard the previously computed
// medians.
// However, once stabilized, `repeat` will slightly vary. Those slight changes
// should not discard the previously computed medians.
// When `repeat` change is <10%, this should not impact the computed medians
// too much, so we do not need to discard them.
const getNextMedian = function(repeat, nextRepeat, median) {
  const repeatDiff = Math.abs(nextRepeat - repeat) / repeat

  if (repeatDiff >= MIN_REPEAT_DIFF) {
    return
  }

  return median
}

const MIN_REPEAT_DIFF = 0.1

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
