/* eslint-disable max-lines */
import { getQuantiles } from './quantile.js'

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
// The logic satisfies the following constaints:
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
//  - OutliersMin|Max 0 should be possible
//  - It should work with integer measures
//  - It should work with consecutive identical measures
//  - It should work with very low sample size, including 1
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

  const outliersThreshold = getInitOutliersThreshold()
  const thresholdsArray = new Array(THRESHOLDS_COUNT).fill()
  return thresholdsArray.reduce(
    (thresholdsIndexes) =>
      getThresholdIndexes(thresholdsIndexes, {
        quantiles,
        reversedQuantiles,
        quantilesCount,
        outliersLimit,
      }),
    {
      outliersMinIndex: 0,
      outliersMaxIndex: 0,
      outliersMinIndexSum: 0,
      outliersMaxIndexSum: 0,
      outliersThreshold,
    },
  )
}

const getOutliersLimit = function (quantilesCount) {
  return Math.floor(quantilesCount * OUTLIERS_LIMIT)
}

// Maximum percentage of min|max outliers.
// This is done independently for outliersMax|Min so they do not influence each
// other.
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
//  1. Trace an exponential curve on the measures' cdf (cumulative distribution
//     function)
//  2. Pick the first quantile over it
//      - A higher `OUTLIER_THRESHOLD` creates steeper curves
//  3. Repeat
const getThresholdIndexes = function (
  {
    outliersMinIndex,
    outliersMaxIndex,
    outliersMinIndexSum,
    outliersMaxIndexSum,
    outliersThreshold,
  },
  { quantiles, reversedQuantiles, quantilesCount, outliersLimit },
) {
  // eslint-disable-next-line fp/no-let
  let outliersMinIncrement = 0
  // eslint-disable-next-line fp/no-let
  let outliersMaxIncrement = 0

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutation
    outliersMaxIncrement = getOutliersIncrement(
      reversedQuantiles,
      outliersMaxIndex,
      quantilesCount - outliersMinIndex,
      outliersLimit,
      outliersThreshold,
    )
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    outliersMaxIndex += outliersMaxIncrement

    // eslint-disable-next-line fp/no-mutation
    outliersMinIncrement = getOutliersIncrement(
      quantiles,
      outliersMinIndex,
      quantilesCount - outliersMaxIndex,
      outliersLimit,
      outliersThreshold,
    )
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    outliersMinIndex += outliersMinIncrement
  } while (outliersMaxIncrement !== 0 || outliersMinIncrement !== 0)

  return {
    outliersMinIndex,
    outliersMaxIndex,
    outliersMinIndexSum: outliersMinIndexSum + outliersMinIndex,
    outliersMaxIndexSum: outliersMaxIndexSum + outliersMaxIndex,
    outliersThreshold: outliersThreshold / THRESHOLDS_FACTOR,
  }
}

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
    const outliersLikelihood = getOutliersLikelihood(
      widthPercentage,
      quantilePercentage,
    )

    // eslint-disable-next-line max-depth
    if (outliersLikelihood > outliersThreshold) {
      return index
    }
  }

  return 0
}

const getOutliersLikelihood = function (widthPercentage, quantilePercentage) {
  return Math.log(1 - widthPercentage) / Math.log(1 - quantilePercentage)
}

// If the following minimum amount of measures leads to >= 50% width reduction,
// they are considered outliers.
// A higher value:
//  - Is less accurate as more information is trimmed
//  - Is more likely to oscillate between bigger outlier threshold values,
//    making the mean, stdev and histogram flicker between different values.
// A lower value:
//  - Is less precise as outliers will have a higher impact on the mean.
//  - Results in wider quantiles, i.e. poorer histograms
const THRESHOLDS_BASE_AMOUNT = 0.01

// Computes based on a 50% width reduction
// Should be kept as is. THRESHOLDS_BASE_AMOUNT should be changed to
// increase|decrease outliers instead.
const THRESHOLDS_BASE_WIDTH = 0.5

// Average outliers threshold
const THRESHOLDS_BASE = getOutliersLikelihood(
  THRESHOLDS_BASE_WIDTH,
  THRESHOLDS_BASE_AMOUNT,
)

// Number of different outliers thresholds to use.
// A higher value is slower to compute.
//  - This follows a logarithmic time complexity since each threshold re-uses
//    the outliers removal from the previous threshold
// A lower value decreases the smoothing effect.
const THRESHOLDS_COUNT = 10

// Multiplying factor between the base threshold and the min|max ones.
// A higher value decreases the accuracy of the outliers removal, making it more
// likely to trim too many or not enough outliers.
// A lower value decreases the smoothing effect.
const THRESHOLDS_SPREAD = 2

// Computes the multiplying factor between each outlier threshold, so that they
// respect both THRESHOLDS_COUNT and THRESHOLDS_MAX_SPREAD.
const getThresholdsFactor = function () {
  const baseExponent = (THRESHOLDS_COUNT - 1) / 2
  return THRESHOLDS_SPREAD ** (1 / baseExponent)
}

const THRESHOLDS_FACTOR = getThresholdsFactor()

// Retrieve the first `outliersThreshold`.
// Each next one is divided by THRESHOLDS_SPREAD.
// There are THRESHOLDS_COUNT of them in total.
// Their center value is OUTLIERS_BASE_THRESHOLD.
const getInitOutliersThreshold = function () {
  const baseExponent = (THRESHOLDS_COUNT - 1) / 2
  return THRESHOLDS_BASE * THRESHOLDS_FACTOR ** baseExponent
}

const computePercentage = function (outliersIndexSum, quantilesCount) {
  return outliersIndexSum / (THRESHOLDS_COUNT * quantilesCount)
}
/* eslint-enable max-lines */
