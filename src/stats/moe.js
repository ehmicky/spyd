import { getStudentTValue } from './critical_values/student_t.js'

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
//  - In practice, this is rarely the case:
//     - Several distributions are usually summed, i.e. producing several modes.
//       For example, if a background process (like garbage collection) operates
//       at regular intervals, it will add its own distribution.
//     - Distributions tend to be lognormal, with a longer tail for slow
//       durations
//  - However, this is fine for practical purpose:
//     - This is close enough to a normal distribution to be useful, while not
//       being completely statistically correct
//     - Removing outliers helps getting closer to a normal distribution
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
export const getMoe = function (stdev, length) {
  const standardError = stdev / Math.sqrt(length)
  const tvalue = getStudentTValue(length - 1)
  const marginOfError = standardError * tvalue
  return marginOfError
}

// Retrieve margin of error relative to the mean.
// This is more useful than moe when comparing different combinations, or when
// targetting a specific precision threshold.
export const getRmoe = function (moe, mean) {
  return moe / mean
}

// Find the `length` that gets a specific `moe` with a given `stdev`.
// This essentially applies the inverse function of `getMoe()`.
// Since `length` is used in non-straight-forward ways (due to `getTvalue()`)
// in `getMoe()`, we need to do an iterative/heuristic search until the value
// is found.
export const getLengthForMoe = function (moeTarget, stdev) {
  const lengths = new Set([])
  // eslint-disable-next-line fp/no-let
  let length = MIN_LENGTH

  // eslint-disable-next-line fp/no-loops
  while (!lengths.has(length)) {
    lengths.add(length)
    // eslint-disable-next-line fp/no-mutation
    length = Math.max(
      Math.round(((getStudentTValue(length - 1) * stdev) / moeTarget) ** 2),
      MIN_LENGTH,
    )
  }

  return length
}

// Minimal `length` with a defined t-value
const MIN_LENGTH = 2
