import { getStudentTValue } from './critical_values/student_t.js'

// Check whether two combinations are too close for their `diff` to be
// statistically significant.
// We do this using a mean-based Welch's t-test instead of:
//  - Student's t-test because it assumes variances are the same
//  - Mann-Whitney u-test because it:
//     - Compares the distributions, not just the means
//     - Has a slower time complexity O(n^2)
//     - Is more complex to implement
//     - Assumes both combinations have similar distributions
//     - Is not as good with skewed distributions
//  - Confidence interval `meanMin|meanMax` because doing so is less
//    statistically accurate
//     - However, this method should be used by users when comparing two
//       combinations of the same result because:
//        - It can be easily done visually
//        - Doing a Welch's t-test between each pair of combinations would
//          be hard to report
// In a nutshell, this is is based on the means difference, number of loops
// and standard deviations:
//  - The t-value improves proportionally with a:
//     - higher difference of means (O(n))
//     - lower stdev (O(n**1/2))
//     - higher length (O(n**1/4))
//  - The degrees of freedom improve proportionally with a:
//     - higher length (O(n**1/2))
//  - Both of them improve proportionally with a lower difference of
//    stdev|length
//     - this means, at some point, increasing the number of loops of the
//       current combination might make its diff imprecise. However, the
//       variation is minimal.
export const isDiffPrecise = function (
  { mean: meanA, stdev: stdevA, loops: loopsA },
  { mean: meanB, stdev: stdevB, loops: loopsB },
) {
  return (
    hasPreciseStdev(stdevA, stdevB) &&
    hasPreciseLoops(loopsA, loopsB) &&
    welchTTest({ meanA, stdevA, loopsA, meanB, stdevB, loopsB })
  )
}

// When the result has not enough measures to compute the standard deviations
const hasPreciseStdev = function (stdevA, stdevB) {
  return stdevA !== undefined && stdevB !== undefined && stdevA + stdevB !== 0
}

// Welch's t-test does not work with extremely low `length`, but those would
// indicate that diff is most likely imprecise anyway.
const hasPreciseLoops = function (loopsA, loopsB) {
  return loopsA > 1 && loopsB > 1
}

const welchTTest = function ({ meanA, stdevA, loopsA, meanB, stdevB, loopsB }) {
  const errorSquaredA = getErrorSquared(stdevA, loopsA)
  const errorSquaredB = getErrorSquared(stdevB, loopsB)
  const tStat = Math.abs(
    (meanA - meanB) / Math.sqrt(errorSquaredA + errorSquaredB),
  )
  const degreesOfFreedom =
    (errorSquaredA + errorSquaredB) ** 2 /
    (errorSquaredA ** 2 / (loopsA - 1) + errorSquaredB ** 2 / (loopsB - 1))
  const tValue = getStudentTValue(Math.floor(degreesOfFreedom))
  return tStat >= tValue
}

const getErrorSquared = function (stdev, length) {
  return (stdev / Math.sqrt(length)) ** 2
}
