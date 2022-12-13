import { OUTLIERS_LIMIT } from './constants.js'
import { THRESHOLDS, isOutlier } from './threshold.js'

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
export const getThresholdsIndexes = (quantiles, quantilesCount) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const reversedQuantiles = [...quantiles].reverse()
  const outliersLimit = getOutliersLimit(quantilesCount)

  return THRESHOLDS.reduce(
    (thresholdsIndexes, threshold) =>
      getThresholdIndexes(thresholdsIndexes, {
        threshold,
        quantiles,
        reversedQuantiles,
        quantilesCount,
        outliersLimit,
      }),
    { maxIndex: 0, minIndex: 0, maxIndexSum: 0, minIndexSum: 0 },
  )
}

const getOutliersLimit = (quantilesCount) =>
  Math.max(Math.floor(quantilesCount * OUTLIERS_LIMIT), 1)

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
const getThresholdIndexes = (
  { maxIndex, minIndex, maxIndexSum, minIndexSum },
  { threshold, quantiles, reversedQuantiles, quantilesCount, outliersLimit },
) => {
  let maxIncrement = 0
  let minIncrement = 0

  do {
    maxIncrement = getOutliersIncrement(
      reversedQuantiles,
      maxIndex,
      quantilesCount - minIndex,
      outliersLimit,
      threshold,
    )
    maxIndex += maxIncrement

    minIncrement = getOutliersIncrement(
      quantiles,
      minIndex,
      quantilesCount - maxIndex,
      outliersLimit,
      threshold,
    )
    minIndex += minIncrement
  } while (maxIncrement !== 0 || minIncrement !== 0)

  return {
    maxIndex,
    minIndex,
    maxIndexSum: maxIndexSum + maxIndex,
    minIndexSum: minIndexSum + minIndex,
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
// eslint-disable-next-line max-statements, complexity
const getOutliersIncrement = (
  quantiles,
  startIndex,
  endIndex,
  outliersLimit,
  threshold,
  // eslint-disable-next-line max-params
) => {
  const start = quantiles[startIndex]
  const end = quantiles[endIndex]
  const width = start - end

  // Edge case: this happens when most measures are identical
  if (width === 0) {
    return 0
  }

  const quantilesAmount = endIndex - startIndex
  const finalIndex = Math.min(
    Math.floor(quantilesAmount / 2),
    outliersLimit - startIndex,
  )

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
    if (isOutlier(widthPercentage, quantilePercentage, threshold)) {
      return index
    }
  }

  return 0
}
