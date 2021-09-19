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
// eslint-disable-next-line max-statements
export const getOutliersPercentages = function (measures) {
  const length = OUTLIERS_GRANULARITY
  const quantiles = getQuantiles(measures, length)
  const width = quantiles[length] - quantiles[0]
  const limitQuantile = Math.floor(length * OUTLIERS_LIMIT)

  if (width === 0 || limitQuantile === 0) {
    return { outliersMin: 0, outliersMax: 0 }
  }

  const limitIndex = length / 2
  const minLimitIndex = Math.floor(limitIndex)
  // eslint-disable-next-line fp/no-mutating-methods
  const minQuantiles = quantiles
    .slice(0, minLimitIndex + 1)
    .reverse()
    .map((quantile) => quantiles[minLimitIndex] - quantile)
  const maxLimitIndex = Math.ceil(limitIndex)
  const maxQuantiles = quantiles
    .slice(maxLimitIndex)
    .map((quantile) => quantile - quantiles[0])

  const outliersMin = getOutliersPercentage(minQuantiles, length, limitQuantile)
  const outliersMax = getOutliersPercentage(maxQuantiles, length, limitQuantile)
  return { outliersMin, outliersMax }
}

// Granularity of the outliers percentage.
// For example, 1e3 means the granularity is 0.1%.
// The granularity is also multiplied by 2 due to `outliersIndex` being always
// an even number (due to its internal logic).
// A higher value makes it slower to compute.
// A lower value makes the value less accurate.
const OUTLIERS_GRANULARITY = 1e3

// Return outliers percentage based on a specific outlier quantile
const getOutliersPercentage = function (
  [median, ...quantiles],
  length,
  limitQuantile,
) {
  const quantileRatios = quantiles.map(
    (quantile, index) => (quantile - median) / (index + 1) ** OUTLIERS_COST,
  )
  const minQuantileRatio = Math.min(...quantileRatios.slice(-limitQuantile))
  const quantileIndex = quantileRatios.lastIndexOf(minQuantileRatio)
  return (quantiles.length - quantileIndex) / length
}

const OUTLIERS_COST = 6
const OUTLIERS_LIMIT = 0.25

// Width threshold where a given quantile is considered an outlier.
// For example, `2` means that any quantile with twice the width of an average
// quantile is considered an outlier.
// Since distribution tend to be lognormal, this number is exponential, i.e.
// decreasing it by a given number has more impact than increasing it by the
// same number.
// A lower value is less accurate as more information is trimmed.
// A higher value is less precise as outliers will have a higher impact on the
// mean. It also results in poorer histograms.
const MIN_OUTLIER_WIDTH = 10
