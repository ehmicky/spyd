import { getStudentTValue } from './critical_values/student_t.js'
import { applyImpreciseEnvDev } from './env_dev/apply.js'
import { getLengthFromLoops } from './length.js'

// Check whether two combinations are too close for their difference to be
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
export const haveSimilarMeans = (
  {
    mean: meanA,
    stdev: stdevA,
    envDev: envDevA,
    loops: loopsA,
    outliersMin: outliersMinA,
    outliersMax: outliersMaxA,
  },
  {
    mean: meanB,
    stdev: stdevB,
    envDev: envDevB,
    loops: loopsB,
    outliersMin: outliersMinB,
    outliersMax: outliersMaxB,
  },
) => {
  if (hasImpreciseStdev(stdevA, stdevB)) {
    return
  }

  const lengthA = getLength({
    loops: loopsA,
    envDev: envDevA,
    outliersMin: outliersMinA,
    outliersMax: outliersMaxA,
  })
  const lengthB = getLength({
    loops: loopsB,
    envDev: envDevB,
    outliersMin: outliersMinB,
    outliersMax: outliersMaxB,
  })

  if (hasImpreciseLengths(lengthA, lengthB)) {
    return
  }

  if (isPerfectStdev(stdevA, stdevB)) {
    return meanA === meanB
  }

  return welchTTest({ meanA, stdevA, lengthA, meanB, stdevB, lengthB })
}

// When the result does not have enough measures, `stdev` and `envDev` are both
// `undefined`.
const hasImpreciseStdev = (stdevA, stdevB) =>
  stdevA === undefined || stdevB === undefined

// Retrieve the `length` of measures from `loops`.
// We take `envDev` into account.
const getLength = ({ loops, envDev, outliersMin, outliersMax }) => {
  const { length } = getLengthFromLoops(loops, outliersMin, outliersMax)
  return applyImpreciseEnvDev(length, envDev, ENV_DEV_IMPRECISION)
}

// A higher value creates more false negatives.
// A lower value creates more false positives.
// False positives are more disruptive to the user experience, so we prefer
// erring towards false negatives.
const ENV_DEV_IMPRECISION = 5

// Welch's t-test does not work with extremely low `length`, but those would
// indicate that diff is most likely imprecise anyway.
const hasImpreciseLengths = (lengthA, lengthB) => lengthA < 2 || lengthB < 2

const isPerfectStdev = (stdevA, stdevB) => stdevA === 0 && stdevB === 0

const welchTTest = ({ meanA, stdevA, lengthA, meanB, stdevB, lengthB }) => {
  const errorSquaredA = getErrorSquared(stdevA, lengthA)
  const errorSquaredB = getErrorSquared(stdevB, lengthB)
  const tStat = Math.abs(
    (meanA - meanB) / Math.sqrt(errorSquaredA + errorSquaredB),
  )
  const degreesOfFreedom =
    (errorSquaredA + errorSquaredB) ** 2 /
    (errorSquaredA ** 2 / (lengthA - 1) + errorSquaredB ** 2 / (lengthB - 1))
  const tValue = getStudentTValue(
    Math.floor(degreesOfFreedom),
    SIGNIFICANCE_LEVEL,
  )
  return tStat < tValue
}

const getErrorSquared = (stdev, length) => (stdev / Math.sqrt(length)) ** 2

// Significance level when computing the welch t-test.
// A higher value increases the false positives
//   - i.e. `diffPrecise: false` but is actually `true`
// A lower value increases the false negatives (inverse).
const SIGNIFICANCE_LEVEL = 0.95
