import { getQuantiles } from '../quantile.js'

import { OUTLIERS_GRANULARITY } from './constants.js'
import { getThresholdsIndexes } from './indexes.js'
import { THRESHOLDS } from './threshold.js'

// Measures usually contain some:
//  - Very slow outliers due to background processes or engine optimization
//  - Faster outliers for similar reasons, although they are less frequent
// We remove both:
//  - Those are not good when determining the normal distribution of measures:
//     - They create a distribution with a very long tail, which is hard to
//       visualize with `histogram`
//     - They make `stdev`, `rstdev`, `moe` and `rmoe` must less useful
//  - Those impact the `mean`
// While trimming outliers is usually bad statistical practice, it makes the
// most sense here since:
//  - Most extreme values are actual outliers, not significant data
//     - Those are influenced by environmental factors unrelated to the task,
//       such as background processes
//  - We cannot use statistics robust to outliers as we need all of those:
//     - The arithmetic mean is what makes most sense as a benchmark's average
//       value considering a task is likely to be repeated and the sum of each
//       iteration's duration would be what matters to users
//        - As opposed to the median, which is more robust but less useful in
//          that context
//     - The min|max is useful as worst|best-case but are highly sensitive to
//       outliers
//     - The `stdev` is not robust to outliers, which has an impact on:
//        - The duration to run benchmark
//        - `meanMin|meanMax`
//        - `diffPrecise`
//     - The histogram
// We remove them from the measures, i.e. from all stats:
//  - Using outliers in some stats but not others would lead to inconsistency
//    and unexpected or ambiguous results
//  - This would require two sets of `min|max` stats (with and without outliers)
// We try to find the best percentage of outliers to remove which:
//  - Minimizes the max-min difference, to increase precision
//  - Without removing too many outliers, to keep accuracy
// We do not:
//  - Use a fixed, hardcoded value since it might trim too much or not enough
//    for a given distribution.
//  - Use an existing outliers statistical methods since most assume a
//    specific distribution (usually normal) while in our case it is usually:
//     - Lognormal, sometimes normal, or even different
//     - Multimodal
// The logic satisfies the following constraints:
//  - It should work with a very big left|right tail
//     - For example, widening the first|last quantile should not change the
//       result
//  - It should work with both fat and slim tails
//  - Small bumps (aggregate of values) in the tail should be ignored providing
//    they are either small and/or far in the tail.
//     - This includes small bumps due to the sample size being low.
//  - For distributions with multiple modes of similar enough size, each mode
//    should be kept, even if far from each other
//  - It should work with the following distributions:
//     - Exponential with a high, continuous slope
//     - Uniform
//     - U-shaped
//  - It should work with integer measures
//  - It should work with consecutive identical measures
//  - It should work with a very low sample size, including 0, 1 or 2
//  - outliersMin|Max 0 should be possible
//  - Making only slight changes to the measures should not result in big
//    changes of outliersMin|Max
// In practice, tasks tend to have the following patterns:
//  - Most have 0-5% slow outliers which are due to both:
//     - Lognormal long tail
//     - Engine optimization, OS background processes, etc.
//  - Many (but not all) have a very small amount of fast outliers (0-0.5%)
//  - A few have a large amount 5-30% of slow outliers which are due to either:
//     - Distribution having multiple modes
//     - Engine optimization, i.e. slow outliers are less frequent as sample
//       size increases
//  - Rarely, there is a large amount of outliers
// Outliers removal can be skipped by using the `outliers: true` configuration
// property:
//  - This is discouraged because:
//     - Outliers performance is usually unrelated to the task itself,
//       i.e. they decrease accuracy.
//     - In many cases, this increases `stdev` a lot, which makes runs much
//       longer.
//     - It makes the `envDev` logic not work well.
//  - However, there are a few cases where outliers are useful:
//     - When a task is a mix of multiple distributions with very different
//      speed, but are all significant, such as:
//        - When a task slows down due to memory allocation but only at
//          specific thresholds
//           - `Array.push()` is an example of this
//        - Tasks with custom units
//     - When real `min|max` is important
//     - When debugging
export const getOutliersPercentage = (measures, outliers) => {
  if (measures.length <= 2 || outliers) {
    return { outliersMin: 0, outliersMax: 0 }
  }

  const quantilesCount = getQuantilesCount(measures)
  const quantiles = getQuantiles(measures, quantilesCount)

  const { minIndexSum, maxIndexSum } = getThresholdsIndexes(
    quantiles,
    quantilesCount,
  )
  const outliersMin = computePercentage(minIndexSum, quantilesCount)
  const outliersMax = computePercentage(maxIndexSum, quantilesCount)
  return { outliersMin, outliersMax }
}

// Retrieve number of quantiles to use
const getQuantilesCount = (measures) =>
  Math.min(OUTLIERS_GRANULARITY, measures.length - 1)

// Compute the final outliersMin|outliersMax percentage
const computePercentage = (indexSum, quantilesCount) => {
  const indexMean = indexSum / THRESHOLDS.length
  return indexMean / quantilesCount
}

export const DEFAULT_OUTLIERS = false
