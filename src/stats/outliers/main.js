/* eslint-disable max-lines */
import { getQuantiles } from '../quantile.js'

import { THRESHOLDS, isOutlier } from './threshold.js'

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

// When using a single outliers threshold:
//  - When there is a small aggregate of measures close to each other in the
//    tail
//     - As opposed to all measures' frequency increasing progressively as they
//       get closer to the mean
//  - Then the outliers search either stops or passes that point, depending on
//    whether there is a relative lack of outliers after it
//  - This creates "stop points" that outliersMin|outliersMax are more likely
//    to use
//  - This means small changes in measures might lead to high changes in
//    outliersMin|outliersMax
//     - Those lead to high changes in other stats, especially stdev, mean,
//       min and max.
//     - This can happen in both directions, for both outliersMin|outliersMax
// We solve this by computing outliersMin|outliersMax with multiple outliers
// thresholds (THRESHOLDS_COUNT) and using their arithmetic mean:
//  - Since each outliers threshold reaches those "stop points" at different
//    times, using more outliers thresholds softens the problem above
//  - We use a "base" outliers threshold (THRESHOLDS_BASE) as average
//     - The other outliers thresholds are increasingly higher|lower than it,
//       using a constant multiplying factor (THRESHOLDS_FACTOR)
//  - The main downside is: wider ranges of outliers thresholds
//    (THRESHOLDS_SPREAD) make that "average" less accurate
//     - This results in outliersMin|outliersMax being too high or too low
//  - On the other side, if the range is too narrow, it will only work with
//    smaller "stop points"
const getThresholdsIndexes = function (quantiles, quantilesCount) {
  // eslint-disable-next-line fp/no-mutating-methods
  const reversedQuantiles = [...quantiles].reverse()
  const outliersLimit = getOutliersLimit(quantilesCount)

  return THRESHOLDS.reduce(
    (thresholdsIndexes, outliersThreshold) =>
      getThresholdIndexes(thresholdsIndexes, outliersThreshold, {
        quantiles,
        reversedQuantiles,
        quantilesCount,
        outliersLimit,
      }),
    {
      outliersMaxIndex: 0,
      outliersMinIndex: 0,
      outliersMaxIndexSum: 0,
      outliersMinIndexSum: 0,
    },
  )
}

// Retrieve maximum amount of outlier quantiles.
// This is applied independently on outliersMax and outliersMin so they do not
// influence each other.
const getOutliersLimit = function (quantilesCount) {
  return Math.floor(quantilesCount * OUTLIERS_LIMIT)
}

// Maximum percentage of min|max outliers.
// A higher value:
//  - Is more likely to result in very high outlier percentages on some edge
//    cases, for example on a distribution with a continuous, very exponential
//    slope.
//  - Is more likely to include significant data instead of outliers only.
// A lower value reduces the benefits of outliers removal.
const OUTLIERS_LIMIT = 0.05

// Computes the index where outliers start on each side.
// The main criteria to consider whether a quantile is likely to be an outlier
// or not is:
//  - Removing a group of {number} quantiles would divide the width (difference
//    between max and min) by {number2}
//  - The {number}/{number2} ratio is computed for each quantile. When higher
//    than a given fixed threshold, the quantile is considered an outlier.
// Outlier quantiles are removed incrementally:
//  - Their width is not taken into account anymore after removal
//     - This ensures the final result is the same no matter how wide the
//       first|last quantile is
//  - Removing two quantiles one after the other should have the same result as
//    removing both at once
//     - This ensures the final result does not change when:
//        - Changing `OUTLIERS_GRANULARITY`
//        - More or less iterations are happening due to slight changes to
//          quantiles as more samples are added
// This results in the following algorithm:
//  - For a given {number} and {number2}, a quantile is considered an outlier
//    regardless of {number3} when it divides the:
//     - Max-min width by {number} * {number3}
//     - Amount of measures by {number2} * {number3}
//  - So, for any {number3}, the result is same when using
//    `widthPercentage ** {number3}` and `quantilePercentage ** {number3}`
//     - For example, if removing 10% of measures to remove 50% of width is ok,
//       then so is doing twice, i.e. 19% of measures for 75% of width
//  - `outlierLikehood` computes this by dividing the inverse function of each
//     side
// Another way to look at it, this is like:
//  1. Trace an exponential curve on the measures' cdf
//     (cumulative distribution function).
//  2. Pick the first quantile over it.
//     A higher `OUTLIER_THRESHOLD` creates steeper curves.
//  3. Repeat.
// Removing outliers on either side reduces the total width, which influences
// computing outliers on the other side:
//  - Therefore, we need to compute outliersMin|outliersMax's side alternatively
// We use imperative code for performance.
/* eslint-disable fp/no-let, fp/no-loops, fp/no-mutation, no-param-reassign */
const getThresholdIndexes = function (
  {
    outliersMaxIndex,
    outliersMinIndex,
    outliersMaxIndexSum,
    outliersMinIndexSum,
  },
  outliersThreshold,
  { quantiles, reversedQuantiles, quantilesCount, outliersLimit },
) {
  let outliersMaxIncrement = 0
  let outliersMinIncrement = 0

  do {
    outliersMaxIncrement = getOutliersIncrement(
      reversedQuantiles,
      outliersMaxIndex,
      quantilesCount - outliersMinIndex,
      outliersLimit,
      outliersThreshold,
    )
    outliersMaxIndex += outliersMaxIncrement

    outliersMinIncrement = getOutliersIncrement(
      quantiles,
      outliersMinIndex,
      quantilesCount - outliersMaxIndex,
      outliersLimit,
      outliersThreshold,
    )
    outliersMinIndex += outliersMinIncrement
  } while (outliersMaxIncrement !== 0 || outliersMinIncrement !== 0)

  return {
    outliersMaxIndex,
    outliersMinIndex,
    outliersMaxIndexSum: outliersMaxIndexSum + outliersMaxIndex,
    outliersMinIndexSum: outliersMinIndexSum + outliersMinIndex,
  }
}
/* eslint-enable fp/no-let, fp/no-loops, fp/no-mutation, no-param-reassign */

// Return a number of the next quantiles are outliers.
//  - This is 0 when there are no more outliers
//  - This might be lower than the total amount of outliers, i.e. must be
//    repeated
// Regardless of the direction, we use the whole range of quantiles to compute
// the `outliersLikelihood`, as opposed to using only one half of it because:
//  - Finding the right "middle" is difficult:
//     - The mode would make more sense than the median
//        - Especially for highly skewed or exponential distributions
//        - But the mode is hard to compute both precisely and accurately when
//          using only samples
//     - For multimodal distributions, especially with big gaps in-between modes
//  - What really matters is the total width and amount of measures, not each
//    individual half
// However, we stop searching after computing it for half of the quantiles:
//  - This is because the closer widthPercentage is to 100%, the more imprecise
//    it is.
//  - This can lead to quantileRatio being much higher than it should just
//    because the measures close to `minIndex` happen to be close to each other.
// We use imperative code and positional arguments for performance.
// eslint-disable-next-line max-statements, complexity, max-params
const getOutliersIncrement = function (
  quantiles,
  startIndex,
  endIndex,
  outliersLimit,
  outliersThreshold,
) {
  if (startIndex >= outliersLimit) {
    return 0
  }

  const start = quantiles[startIndex]
  const end = quantiles[endIndex]
  const width = start - end

  // Edge case: this happens when most measures are identical
  if (width === 0) {
    return 0
  }

  const quantilesAmount = endIndex - startIndex
  const finalIndex = Math.floor(quantilesAmount / 2)

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 1; index <= finalIndex; index += 1) {
    const quantile = quantiles[startIndex + index]
    const widthPercentage = (start - quantile) / width

    // Edge case: this happens when half of measures are identical
    // eslint-disable-next-line max-depth
    if (widthPercentage === 1) {
      return 0
    }

    const quantilePercentage = index / quantilesAmount

    // eslint-disable-next-line max-depth
    if (isOutlier(widthPercentage, quantilePercentage, outliersThreshold)) {
      return index
    }
  }

  return 0
}

// Compute the final outliersMin|outliersMax percentage
const computePercentage = function (outliersIndexSum, quantilesCount) {
  const outliersIndexMean = outliersIndexSum / THRESHOLDS.length
  return outliersIndexMean / quantilesCount
}
/* eslint-enable max-lines */
