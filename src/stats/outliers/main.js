import { getQuantiles } from '../quantile.js'

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
export const getOutliersPercentages = function (measures) {
  if (measures.length <= 2) {
    return { outliersMin: 0, outliersMax: 0 }
  }

  const quantilesCount = getQuantilesCount(measures)
  const quantiles = getQuantiles(measures, quantilesCount)

  const { outliersMinIndexSum, outliersMaxIndexSum } = getThresholdsIndexes(
    quantiles,
    quantilesCount,
  )
  const outliersMin = computePercentage(outliersMinIndexSum, quantilesCount)
  const outliersMax = computePercentage(outliersMaxIndexSum, quantilesCount)
  return { outliersMin, outliersMax }
}

// Retrieve number of quantiles to use
const getQuantilesCount = function (measures) {
  return Math.min(OUTLIERS_GRANULARITY, measures.length - 1)
}

// Number of quantiles to use to find outliersMin|outliersMax.
// The algorithm is chosen so that changing the granularity does not
// significantly change the final result.
// A higher value it slower to compute
//  - The time complexity is roughly linear
// A lower value makes the value:
//  - Less granular, i.e. outlier percentages changes from samples to samples
//    will be higher
//     - The minimum change is determined by
//       1 / (OUTLIERS_GRANULARITY * THRESHOLDS_COUNT)
//     - For example, with OUTLIERS_GRANULARITY 2e3 and THRESHOLDS_COUNT 10,
//       outliersMin|outliersMax granularity is 0.005%
//  - Less accurate
//  - More variable
const OUTLIERS_GRANULARITY = 2e3

// Compute the final outliersMin|outliersMax percentage
const computePercentage = function (outliersIndexSum, quantilesCount) {
  const outliersIndexMean = outliersIndexSum / THRESHOLDS.length
  return outliersIndexMean / quantilesCount
}