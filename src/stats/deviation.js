import { getTvalue } from './tvalue.js'

// Retrieve standard deviation of an array of floats (cannot be NaN/Infinity).
// Array must not be empty.
// We use the median, not the mean, because it is more stable and is privileged
// in reporting.
export const getStandardDeviation = function (array, median) {
  if (median === 0 || array.length < MIN_DEVIATION_LOOPS) {
    return
  }

  const variance = getSumDeviation(array, median) / (array.length - 1)
  return Math.sqrt(variance)
}

// The standard deviation might be very imprecise when there are not enough
// values to compute it from.
// A higher value makes standard deviation less likely to be computed for very
// slow tasks.
// A lower value makes it more likely to use inaccurate standard deviations.
const MIN_DEVIATION_LOOPS = 5

// We use a separate function from `getSum()` because it is much more performant
const getSumDeviation = function (array, median) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops
  for (const element of array) {
    // eslint-disable-next-line fp/no-mutation
    sum += (element - median) ** 2
  }

  return sum
}

// Retrieve standard deviation, relative to the median.
export const getRelativeDeviation = function (standardDeviation, median) {
  if (standardDeviation === undefined) {
    return
  }

  return standardDeviation / median
}

// Retrieve margin of error, relative to the median
// The standard error:
//  - Is the standard deviation that would be obtained by repeating the same
//    benchmark
//  - This is providing the underlying distribution remained the same. In
//    practice, there is always a variation due to the environment. So it is
//    more accurately described as the maximum difference between the current
//    median and the future median if we kept measuring forever.
//  - In other terms, it measures the precision of the current median, but not
//    the potential variation with the next median.
// The margin of error:
//  - Computes a range around the median where there is 95% of probability that
//    the real median (if we kept measuring forever) would fall.
//  - It uses time duration, which is easier when considering a single
//    combination precision
// The relative margin of error:
//  - Is the margin of error, but as a percentage relative to the median
//  - It uses percentages, which is easier when comparing several combinations
//    precision
// This all relies on measures following a normal distribution
//  - In practice, this is rarely the case:
//     - Several distributions are usually summed, i.e. producing several modes.
//       For example, if a background process (like garbage collection) operates
//       at regular intervals, it will add its own distribution.
//     - Distributions tend to be lognormal, with a longer tail for slow
//       durations
//  - However, this is fine for practical purpose:
//     - This is close enough to a normal distribution to be useful, while not
//       being completely statistically correct
//     - Removing the slow|fast outliers helps getting closer to a normal
//       distribution
export const getRelativeMarginOfError = function (
  array,
  standardDeviation,
  median,
) {
  if (standardDeviation === undefined) {
    return
  }

  const { length } = array
  const standardError = standardDeviation / Math.sqrt(length)
  const tvalue = getTvalue(length)
  const marginOfError = standardError * tvalue
  const relativeMarginOfError = marginOfError / median
  return relativeMarginOfError
}
