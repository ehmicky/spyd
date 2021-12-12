import { getMean } from './sum.js'

// Tasks usually get faster as they repeat
//  - This is due to optimization at the enginer or OS level.
// This means a benchmark might end too early, while the task is still getting
// faster
//  - This is less precise, since the next run might end at a different time.
//  - This is also less accurate, since the benchmark targets an arbitrary
//    point in the optimization curve instead of the final one.
//  - This also tends not to give enough measures for `envDev` to be accurate
//    enough, making it be too low.
// We prevent this by guessing whether this optimization phase is still ongoing
// or not
//  - This is combined with `rmoe` as a way to determine whether to end the
//    benchmark.
// This works by computing `stats.cold`:
//  - This is the difference (as a percentage) between the total `mean` and what
//    the `mean` was approximately halfway through the run.
//  - The benchmark only ends when this percentage is below the same threshold
//    as the one used by `stats.rmoe`.
export const getCold = function (
  array,
  {
    mean = getMean(array),
    filter = defaultFilter,
    length = array.filter(filter).length,
  },
) {
  const minIndex = getIndexFromLength(COLD_MIN_PERCENTAGE, length)
  const maxIndex = getIndexFromLength(COLD_MAX_PERCENTAGE, length)
  const { closestMean } = findIncrementalMean(array, {
    mean,
    minIndex,
    maxIndex,
    filter,
  })
  const cold = Math.abs(mean - closestMean) / mean
  return cold
}

// Approximate the number of loops left for `cold` to be below `precisionTarget`
export const getColdLoopsLeft = function (
  array,
  {
    precisionTarget,
    mean = getMean(array),
    filter = defaultFilter,
    length = array.filter(filter).length,
  },
) {
  const incrementalMeanMin = mean * (1 - precisionTarget)
  const incrementalMeanMax = mean * (1 + precisionTarget)
  const minIndex = getIndexFromLength(COLD_MAX_PERCENTAGE, length)
  const maxIndex = length - 1
  const { index } = findIncrementalMean(array, {
    minIndex,
    maxIndex,
    filter,
    incrementalMeanMin,
    incrementalMeanMax,
  })
  const coldLoopsLeft = getLengthFromIndex(COLD_MAX_PERCENTAGE, index) - length
  return coldLoopsLeft
}

const defaultFilter = function () {
  return true
}

const getIndexFromLength = function (percentage, length) {
  return Math.floor(percentage * (length - 1))
}

const getLengthFromIndex = function (percentage, index) {
  return Math.ceil(index / percentage) + 1
}

// The very first measures are sometimes abnormally fast.
//  - This will make `cold` abnormally low as well, which can make the benchmark
//    end too early.
//  - The purpose of `COLD_MIN_PERCENTAGE` is to prevent this by removing
//    early measures.
//  - A lower `COLD_MIN_PERCENTAGE` makes `cold` be lower for a longer amount
//    of measures when the very first measures are abnormally fast.
// When `incrementalMean` changes, `cold` increases. This lasts until this
// change reaches the index at `COLD_MAX_PERCENTAGE`
//  - A higher `COLD_MAX_PERCENTAGE` makes `cold` increase last for fewer
//    measures, which reduces the benefits of `cold`.
// Even when `incrementalMean` has stabilized, it tends to fluctuate.
//  - This makes `cold` fluctuate with it.
//  - This might make the benchmark last for too long if `rmoe` is already
//    low enough.
//  - The purpose of using a range of `incrementalMean`s is to soften that
//    fluctuation.
//  - We look for any `incrementalMean` close enough within that range. We could
//    require all of them to be close enough instead, but this would not work
//    since `incrementalMean` fluctuates too much.
//  - I.e. a higher `COLD_MIN_PERCENTAGE` or a lower `COLD_MAX_PERCENTAGE` will
//    make `cold` fluctuate more once `incrementalMean` has stabilized.
const COLD_MIN_PERCENTAGE = 0.1
const COLD_MAX_PERCENTAGE = 0.6

// Compute the mean incrementally, measure by measure.
// Then retrieve the `incrementalMean` that is the closest to the total `mean`,
// within a specific range decided by `minIndex` and `maxIndex`.
// This must be performend on unsorted `measures`.
//  - Therefore, outliers are still present and must be removed using a `filter`
//  - This also requires using two indexes: filtered and not.
// `minIndex` is always <= `maxIndex`, i.e. a `closestMean` is always found.
// Time complexity is `O(n)`.
// Memory complexity is `O(1)` and very low by using a streaming logic.
// This is optimized for performance, which explains the usage of imperative
// programming patterns.
// This function is also used to find the first `incrementalMean` between
// `incrementalMeanMin` and `incrementalMax`
//  - This behavior is toggled by using `mean: undefined`
/* eslint-disable max-statements, complexity, fp/no-let, fp/no-loops,
   fp/no-mutation, max-depth, no-continue */
const findIncrementalMean = function (
  array,
  { mean, minIndex, maxIndex, filter, incrementalMeanMin, incrementalMeanMax },
) {
  let closestMean = 0
  let closestMeanDiff = Number.POSITIVE_INFINITY
  let sum = 0
  let index = -1
  let filteredIndex = 0

  while (filteredIndex <= maxIndex) {
    index += 1
    const value = array[index]

    if (!filter(value)) {
      continue
    }

    filteredIndex += 1
    sum += value

    if (filteredIndex <= minIndex) {
      continue
    }

    const incrementalMean = sum / filteredIndex

    if (mean !== undefined) {
      const meanDiff = Math.abs(mean - incrementalMean)

      if (closestMeanDiff > meanDiff) {
        closestMeanDiff = meanDiff
        closestMean = incrementalMean
      }
    } else if (
      incrementalMean >= incrementalMeanMin &&
      incrementalMean <= incrementalMeanMax
    ) {
      return { index }
    }
  }

  return { closestMean, index: maxIndex }
}
/* eslint-enable max-statements, complexity, fp/no-let, fp/no-loops,
   fp/no-mutation, max-depth, no-continue */
