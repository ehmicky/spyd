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
// We remove them from the measures, i.e. from all stats:
//  - Using outliers in some stats but not others would lead to inconsistency
//    and unexpected or ambiguous results
//  - This would require two sets of `min|max` stats (with and without outliers)
// We try to find the best percentage of outliers to remove which:
//  - Minimizes the max-min difference, to increase precision
//  - Without removing too many outliers, to keep accuracy
// We compute it based on the actual measures distribution instead of using a
// fixed, hardcoded value which might trim too much or not enough for a given
// array of measures.
export const getOutliersPercentages = function (measures) {
  if (measures.length <= 2) {
    return { outliersMin: 0, outliersMax: 0 }
  }

  const quantilesCount = getQuantilesCount(measures)
  const quantiles = getQuantiles(measures, quantilesCount)
  // eslint-disable-next-line fp/no-mutating-methods
  const reversedQuantiles = [...quantiles].reverse()
  const { outliersMinIndex, outliersMaxIndex } = getOutliers(
    quantiles,
    reversedQuantiles,
    quantilesCount,
  )
  const outliersMin = outliersMinIndex / quantilesCount
  const outliersMax = outliersMaxIndex / quantilesCount
  return { outliersMin, outliersMax }
}

const getQuantilesCount = function (measures) {
  return Math.min(Math.ceil(1 / OUTLIERS_GRANULARITY), measures.length - 1)
}

// Minimum increment between two outliers percentages.
// For example, 1e-3 means the granularity is 0.1%.
// A higher value it slower to compute.
// A lower value makes the value:
//  - Less accurate
//  - More variable, making it sometimes flicker
const OUTLIERS_GRANULARITY = 1e-4

// eslint-disable-next-line max-statements
const getOutliers = function (quantiles, reversedQuantiles, quantilesCount) {
  const outliersLimit = Math.floor(quantilesCount * OUTLIERS_LIMIT)

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
      quantilesCount - outliersMinIndex,
      outliersLimit,
    )
    // eslint-disable-next-line fp/no-mutation
    newOutliersMinIndex = getNextOutliersIndex(
      quantiles,
      outliersMinIndex,
      quantilesCount - newOutliersMaxIndex,
      outliersLimit,
    )
  } while (
    outliersMinIndex !== newOutliersMinIndex ||
    outliersMaxIndex !== newOutliersMaxIndex
  )

  return { outliersMinIndex, outliersMaxIndex }
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
//  - This can lead to quantileRatio being much higher than it should just
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

    // Edge case: this happens when half of measures are identical
    // eslint-disable-next-line max-depth
    if (widthPercentage === 1) {
      return maxIndex
    }

    const quantilePercentage = (index - maxIndex) / quantilesCount
    const outliersLikelihood = getOutliersLikelihood(
      widthPercentage,
      quantilePercentage,
    )

    // eslint-disable-next-line max-depth
    if (outliersLikelihood > OUTLIERS_THRESHOLD) {
      return index
    }
  }

  return maxIndex
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
const OUTLIERS_BASE_AMOUNT = 0.01
// Computes based on a 50% width reduction
const OUTLIERS_BASE_WIDTH = 0.5
const OUTLIERS_THRESHOLD = getOutliersLikelihood(
  OUTLIERS_BASE_WIDTH,
  OUTLIERS_BASE_AMOUNT,
)
