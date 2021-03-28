import { getTvalue } from './tvalue.js'

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
export const getMoe = function (array, stdev, median) {
  if (stdev === undefined) {
    return
  }

  const { length } = array
  const standardError = stdev / Math.sqrt(length)
  const tvalue = getTvalue(length)
  const marginOfError = standardError * tvalue
  const relativeMarginOfError = marginOfError / median
  return relativeMarginOfError
}
