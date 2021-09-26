import { getQuantiles } from './quantile.js'

// Compute the best percentage of outliers to remove.
// This tries to find the best percentage which:
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
    )
    // eslint-disable-next-line fp/no-mutation
    newOutliersMinIndex = getNextOutliersIndex(
      quantiles,
      outliersMinIndex,
      length - newOutliersMaxIndex,
    )
  } while (
    outliersMinIndex !== newOutliersMinIndex ||
    outliersMaxIndex !== newOutliersMaxIndex
  )

  const outliersMin = outliersMinIndex / length
  const outliersMax = outliersMaxIndex / length
  return { outliersMin, outliersMax }
}

// We only increment the index by 1, even if the `for` loop used several
// quantiles. Otherwise, when there is a bump on the outliers tail close the
// exclusion threshold, the task might flicker between inclusion and exclusion,
// creating big jumps for stdev, mean, min|max and histogram.
// We only go through half of the quantiles:
//  - This is because the closer widthPercentage is to 100%, the more imprecise
//    it is.
//  - This can lead to quantileRatio to be much higher than it should just
//    because the measures close to `minIndex` happen to be close to each other.
// eslint-disable-next-line max-statements, complexity
const getNextOutliersIndex = function (quantiles, maxIndex, minIndex) {
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
    const quantile = quantiles[index]

    // eslint-disable-next-line max-depth
    if (quantile === max) {
      return maxIndex
    }

    const widthPercentage = (max - quantile) / width
    const quantilePercentage = (index - maxIndex) / quantilesCount
    const quantileRatio = getQuantileRatio(widthPercentage, quantilePercentage)

    // eslint-disable-next-line max-depth
    if (quantileRatio > OUTLIERS_THRESHOLD) {
      return maxIndex + 1
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
