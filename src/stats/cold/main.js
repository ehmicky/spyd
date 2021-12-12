import { getMean } from '../sum.js'

import { findClosestMean, findHotIndex } from './find.js'

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
export const getColdStats = function (
  array,
  {
    precisionTarget,
    mean = getMean(array),
    filter = defaultFilter,
    length = array.filter(filter).length,
  },
) {
  const cold = getCold(array, { mean, filter, length })
  const coldLoopsTarget = getColdLoopsTarget(array, {
    precisionTarget,
    mean,
    filter,
    length,
  })
  return { cold, coldLoopsTarget }
}

const defaultFilter = function () {
  return true
}

const getCold = function (array, { mean, filter, length }) {
  const minIndex = getIndexFromLength(COLD_MIN_PERCENTAGE, length)
  const maxIndex = getIndexFromLength(COLD_MAX_PERCENTAGE, length)
  const closestMean = findClosestMean(array, {
    mean,
    minIndex,
    maxIndex,
    filter,
  })
  const cold = Math.abs(mean - closestMean) / mean
  return cold
}

// Approximate the number of loops left for `cold` to be below `precisionTarget`
// Used to estimate the duration of the benchmark in previews.
const getColdLoopsTarget = function (
  array,
  { precisionTarget, mean, filter, length },
) {
  const minIndex = getIndexFromLength(COLD_MIN_PERCENTAGE, length)
  const incrementalMeanMin = mean * (1 - precisionTarget)
  const incrementalMeanMax = mean * (1 + precisionTarget)
  const hotIndex = findHotIndex(array, {
    minIndex,
    filter,
    incrementalMeanMin,
    incrementalMeanMax,
  })
  const hotLength = getLengthFromIndex(COLD_MAX_PERCENTAGE, hotIndex)
  const coldLengthTarget = Math.max(hotLength - length, 0)
  const filterRatio = array.length / length
  const coldLoopsTarget = Math.round(coldLengthTarget * filterRatio)
  return coldLoopsTarget
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
