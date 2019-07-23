import { now } from './now.js'

// TODO: remove `depth` once it's clear we don't need it
export const getMedian = function(main, duration) {
  const getTime = measure.bind(null, main)
  const runEnd = now() + duration / 2
  return recursiveMedian(getTime, runEnd, 0, true)
}

const measure = function(main) {
  const start = now()
  main()
  const end = now()
  return end - start
}

const recursiveMedian = function(
  getTime,
  runEnd,
  depth,
  recurse,
  timeA = getTime(),
) {
  const timeB = getTime()
  const timeC = getTime()
  const median = medianOfThree(timeA, timeB, timeC)

  if (!recurse || now() > runEnd) {
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
