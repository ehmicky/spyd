import { getQuantiles } from './quantile.js'

// Measures usually contain some:
//  - Very slow outliers due to background processes or engine optimization
//  - Faster outliers for similar reasons, although they are less frequent
// We remove both:
//  - Those are not good when determining the normal distribution of measures:
//     - They create a distribution with a very long tail, which is hard to
//       visualize with `histogram`
//     - They make `stdev`, `rstdev`, `moe` and `rmoe` must less useful
//  - Using outliers in some stats but not others would lead to inconsistency
//    and unexpected or ambiguous results
//  - This would require two sets of `min|max` stats (with and without outliers)
//  - Despite this, those would be useful to know worst-case scenarios or the
//    average performance when repeated. We tradeoff simplicity for accuracy.
// This tries to find the best percentage of outliers to remove which:
//  - Minimizes the max-min difference, to increase precision
//  - Without removing too many outliers, to keep accuracy
// Computing it based on the measures distribution is much better than
// hardcoding specific outliers thresholds.
//  - For example, the threshold automatically adapts to the measures
//    distribution. Otherwise, the max-min range might flicker when the
//    threshold is close a big outlier.
// This is applied separately on max and min outliers.
export const getOutliersPercentages = function (measures) {
  if (measures.length <= 2) {
    return { outliersMin: 0, outliersMax: 0 }
  }

  const length = Math.min(
    Math.ceil(1 / OUTLIERS_GRANULARITY),
    measures.length - 1,
  )
  const quantiles = getQuantiles(measures, length)
  // eslint-disable-next-line fp/no-mutating-methods
  const reversedQuantiles = [...quantiles].reverse()
  const { outliersMin, outliersMax } = getOutliers(
    quantiles,
    reversedQuantiles,
    length,
  )
  return { outliersMin, outliersMax }
}

// Minimum increment between two outliers percentages.
// For example, 1e-3 means the granularity is 0.1%.
// A higher value it slower to compute.
// A lower value:
//  - Makes the value less accurate
//  - Makes the value more variable, making it sometimes flicker
const OUTLIERS_GRANULARITY = 1e-4

// eslint-disable-next-line max-statements
const getOutliers = function (quantiles, reversedQuantiles, length) {
  const outliersLimit = Math.floor(length * OUTLIERS_LIMIT)

  // eslint-disable-next-line fp/no-let, init-declarations
  let outliersMinIndex
  // eslint-disable-next-line fp/no-let, init-declarations
  let outliersMaxIndex
  // eslint-disable-next-line fp/no-let
  let newOutliersMinIndex = 0
  // eslint-disable-next-line fp/no-let
  let newOutliersMaxIndex = 0

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutation
    outliersMinIndex = newOutliersMinIndex
    // eslint-disable-next-line fp/no-mutation
    outliersMaxIndex = newOutliersMaxIndex
    // eslint-disable-next-line fp/no-mutation
    newOutliersMaxIndex = getNextOutliersIndex(
      reversedQuantiles,
      outliersMaxIndex,
      length - outliersMinIndex,
      outliersLimit,
    )
    // eslint-disable-next-line fp/no-mutation
    newOutliersMinIndex = getNextOutliersIndex(
      quantiles,
      outliersMinIndex,
      length - newOutliersMaxIndex,
      outliersLimit,
    )
  } while (
    outliersMinIndex !== newOutliersMinIndex ||
    outliersMaxIndex !== newOutliersMaxIndex
  )

  const outliersMin = outliersMinIndex / length
  const outliersMax = outliersMaxIndex / length
  return { outliersMin, outliersMax }
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

// We only go through half of the quantiles:
//  - This is because the closer widthPercentage is to 100%, the more imprecise
//    it is.
//  - This can lead to quantileRatio to be much higher than it should just
//    because the measures close to `minIndex` happen to be close to each other.
// eslint-disable-next-line max-statements, complexity, max-params
const getNextOutliersIndex = function (
  quantiles,
  maxIndex,
  minIndex,
  outliersLimit,
) {
  if (maxIndex >= outliersLimit) {
    return maxIndex
  }

  const max = quantiles[maxIndex]
  const min = quantiles[minIndex]
  const width = max - min

  if (width === 0) {
    return maxIndex
  }

  const quantilesCount = minIndex - maxIndex
  const startIndex = maxIndex + 1
  const endIndex = maxIndex + Math.floor(quantilesCount / 2)

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = startIndex; index < endIndex; index += 1) {
    const widthPercentage = (max - quantiles[index]) / width

    // eslint-disable-next-line max-depth
    if (widthPercentage === 1) {
      return maxIndex
    }

    const quantilePercentage = (index - maxIndex) / quantilesCount
    const quantileRatio = getQuantileRatio(widthPercentage, quantilePercentage)

    // eslint-disable-next-line max-depth
    if (quantileRatio > OUTLIERS_THRESHOLD) {
      return index
    }
  }

  return maxIndex
}

const getQuantileRatio = function (widthPercentage, quantilePercentage) {
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
const OUTLIERS_BASE_AMOUNT = 0.01
// Computes based on a 50% width reduction
const OUTLIERS_BASE_WIDTH = 0.5
const OUTLIERS_THRESHOLD = getQuantileRatio(
  OUTLIERS_BASE_WIDTH,
  OUTLIERS_BASE_AMOUNT,
)
