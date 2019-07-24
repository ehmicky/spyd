import { now } from './now.js'
import { getTimeResolution } from './resolution.js'

const TIME_RESOLUTION = getTimeResolution()
const MIN_PRECISION = 1e2
const MIN_PRECISION_TIME = TIME_RESOLUTION * MIN_PRECISION

export const getMedian = function(main, duration) {
  const getTime = measure.bind(null, main)
  const runEnd = now() + duration
  return recursiveMedian(getTime, runEnd, 0, true)
}

const measure = function(main, repeat = 1) {
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
  return (end - start) / repeat
}

const recursiveMedian = function(
  getTime,
  runEnd,
  depth,
  recurse,
  timeA = getTime(),
) {
  if (now() > runEnd) {
    return timeA
  }

  const timeB = getTime()
  const timeC = getTime()
  const median = medianOfThree(timeA, timeB, timeC)

  if (!recurse) {
    return median
  }

  const recursiveGetTime = recursiveMedian.bind(
    null,
    getTime,
    runEnd,
    depth,
    false,
  )
  return recursiveMedian(recursiveGetTime, runEnd, depth + 1, true, median)
}

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
