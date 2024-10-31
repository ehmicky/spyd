import { getStudentTValue } from './critical_values/student_t.js'
import { applyEnvDev } from './env_dev/apply.js'
import { areIdenticalMeasures, IDENTICAL_VARIANCE_SHIFT } from './variance.js'

// Like `getMoe()` but taking `envDev` into account
export const getAdjustedMoe = (stdev, length, envDev) => {
  const adjustedLength = applyEnvDev(length, envDev)
  const adjustedLengthA = Math.max(Math.round(adjustedLength), MIN_LENGTH)
  return getMoe(stdev, adjustedLengthA)
}

// Retrieve margin of error, relative to the mean
// The standard error:
//  - Is the standard deviation that would be obtained by repeating the same
//    benchmark
//  - This is providing the underlying distribution remained the same. In
//    practice, there is always a variation due to the environment. So it is
//    more accurately described as the maximum difference between the current
//    mean and the future mean if we kept measuring forever.
//  - In other terms, it measures the precision of the current mean, but not
//    the potential variation with the next mean
//     - I.e. this does not measure the possible range of mean in future
//       measures
//     - For example, variation might come from the environment (such as machine
//       load)
// The margin of error:
//  - Computes a range around the mean where there is 95% of probability that
//    the real mean (if we kept measuring forever) would fall.
//  - It uses time duration, which is easier when considering a single
//    combination precision
// The moe is meant to be reported:
//  - by mean-focused reporters (not distribution-focused)
//  - either graphically (stats.moe) or as a duration (stats.moePretty)
// The moe is useful:
//  - both for:
//     - reporting each combination's precision
//     - knowing if two combinations are comparable, by checking if their moe
//       overlaps
//        - this is statistically imperfect, i.e. just an approximation
//        - the proper way would be to use a welch's t-test
//  - for those reasons, using the moe as an absolute duration is more useful in
//    reporting than using the moe relative to the mean (percentage)
// This all relies on measures following a normal distribution
//  - In practice:
//     - Distributions tend to be normal-to-lognormal:
//        - Most of the times (but not always) longer tail are on the slow side
//        - Can also be more uniform when using randomness as input
//     - Distribution often have multiple modes
//        - Due to:
//           - Engine optimization
//              - This is because optimization is sometimes triggered at
//                specific thresholds, as opposed to progressively
//              - This means the earlier modes decrease in frequency as run
//                continues
//           - The `repeat` loop
//           - Performing specific operations at regular thresholds such as:
//              - Memory allocation on a growing array
//                 - e.g. `Array.push()` does this, leading to its duration to
//                   be very fast most of the times, and much slower rarely
//              - Background processes
//                 - The outliers logic helps removing most of them though
//           - Logic using randomness
//        - This is less common for logic with higher complexity
//  - However, this is fine thanks to the Central limit theorem
// We do not report whether each combinations pair is statistically comparable:
//  - reporting it with some symbol on combination names does not work well:
//     - when combination name is graphically spread, e.g. when the reporter
//       is splitting dimensions as a table
//     - one combination might be equivalent with two other combinations, but
//       those two other combinations might not be equivalent between each
//       other, making ordering complicated
//  - reporting it on means does not work either because whether combinations
//    are comparable must be done for each combinations pair, not only the next
//    slower combination
//  - this can still be added in the future with a reporter showing a list of
//    too-close-to-compare combinations, using a welch's t-test between each
//    combination pair
export const getMoe = (stdev, length) => {
  const standardError = stdev / Math.sqrt(length)
  const tValue = getTvalue(length)
  const moe = standardError * tValue
  return moe
}

// Retrieve margin of error relative to the mean.
// This is more useful than moe when comparing different combinations, or when
// targeting a specific `precision`.
// Confidence interval:
//  - Unlike `moe`, `rmoe` can be impacted by the mean's inaccuracy (due to
//    being estimated)
//     - This can make run end earlier than expected
//  - It would be more accurate to use a confidence interval, i.e. `rmoeMin|Max`
//    instead of `rmoe`
//     - using `moe / meanMin|Max` instead of `moe / mean`
//     - `rmoeMax` would be used like `rmoe`, i.e. mostly to check to see if
//        combination should end
//  - While it would be more accurate, we do not use a confidence interval
//    because:
//     - The difference with `rmoe` is:
//        - Too low to be worth the added complexity
//        - Constant for a given `precision`, i.e. could be considered part of
//          the `precision` itself
//           - e.g. 10% `precision` is actually always `[9.1%, 11.1%]`
//     - It is not a problem even when mean inaccuracy is high
//        - Because that is only likely when rstdev is high and sample size low
//        - Which is proportional to a higher `moe|rmoe`
export const getRmoe = (moe, mean) => moe / mean

// Find the `length` that gets a specific `moe` with a given `stdev`.
// This essentially applies the inverse function of `getMoe()`.
// Since `length` is used in non-straight-forward ways (due to
// `getStudentTvalue()`) in `getMoe()`, we need to do an iterative/heuristic
// search until the value is found.
export const getLengthForMoe = ({ mean, stdev, min, max, precision }) => {
  const invertLength = areIdenticalMeasures(min, max)
    ? invertLengthIdentical.bind(undefined, precision)
    : invertLengthNormal.bind(undefined, { mean, stdev, precision })

  const lengths = new Set([])
  // eslint-disable-next-line fp/no-let
  let length = MIN_LENGTH

  // eslint-disable-next-line fp/no-loops
  while (!lengths.has(length)) {
    lengths.add(length)
    const tValue = getTvalue(length)
    // eslint-disable-next-line fp/no-mutation
    length = Math.max(Math.ceil(invertLength(tValue)), MIN_LENGTH)
  }

  return length
}

const invertLengthIdentical = (precision, tValue) =>
  (tValue * IDENTICAL_VARIANCE_SHIFT) / precision

const invertLengthNormal = ({ mean, stdev, precision }, tValue) =>
  ((tValue * stdev) / (precision * mean)) ** 2

// Minimal `length` with a defined t-value
const MIN_LENGTH = 2

const getTvalue = (length) => getStudentTValue(length - 1, SIGNIFICANCE_LEVEL)

// Significance level when computing the `moe`.
// A lower value:
//  - Makes measures outside the confidence interval more frequent
//  - Requires a higher `MIN_STDEV_LOOPS`
// A higher value slows benchmarks.
const SIGNIFICANCE_LEVEL = 0.95
