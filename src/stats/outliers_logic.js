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
  const length = OUTLIERS_GRANULARITY
  const quantiles = getQuantiles(measures, length)
  const width = quantiles[length] - quantiles[0]

  if (width === 0) {
    return { outliersMin: 0, outliersMax: 0 }
  }

  const outliersMin = getOutliersPercentage(
    // eslint-disable-next-line fp/no-mutating-methods
    [...quantiles].reverse().map((quantile) => quantiles[length] - quantile),
    length,
    width,
  )
  const outliersMax = getOutliersPercentage(quantiles, length, width)
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
const getOutliersPercentage = function (quantiles, length, width) {
  const quantileRatios = Array.from({ length }, (_, index) =>
    getQuantileRatio({ index, quantiles, length, width }),
  )
  const outliersIndex = getOutliersIndex(quantileRatios)
  return outliersIndex === -1 ? 0 : (length - outliersIndex) / length
}

const getQuantileRatio = function ({ index, quantiles, length, width }) {
  const widthPercentage = (quantiles[length] - quantiles[index]) / width
  const quantilePercentage = 1 - index / length
  return widthPercentage / quantilePercentage
}

// Find the highest quantile index where a majority of the remaining quantiles
// are outliers.
// This method works well with:
//  - Unsmoothed distributions where some outlier quantiles might be narrower
//    due to statistical imprecision
//  - Both fat and slim outliers tails
//  - Removing small aggregate of outliers, while still keeping much bigger ones
const getOutliersIndex = function (quantileRatios) {
  return quantileRatios.findIndex(
    (quantileRatio) => quantileRatio >= MIN_OUTLIER_WIDTH,
  )
}

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
