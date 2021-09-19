import { getQuantiles } from './quantile.js'

// Compute the best percentage of outliers to remove.
// This tries to find the best percentage which:
//  - Minimizes the max-min difference, to increase precision
//  - Without removing too many outliers, to keep accuracy
// This is applied separately on max and min outliers.
export const getOutliersPercentage = function (measures) {
  const length = OUTLIERS_GRANULARITY
  const quantiles = getQuantiles(measures, length)
  const width = quantiles[length] - quantiles[0]

  if (width === 0) {
    return 0
  }

  const outliersChecks = Array.from({ length }, (_, index) =>
    checkOutliers({ index, quantiles, length, width }),
  )
  const outliersIndex = getOutliersIndex(outliersChecks, length)
  return outliersIndex === undefined ? 0 : 1 - outliersIndex / length
}

// Granularity of the outliers percentage.
// For example, 1e3 means the granularity is 0.1%.
// A higher value makes it slower to compute.
// A lower value makes the value less accurate.
const OUTLIERS_GRANULARITY = 1e3

const checkOutliers = function ({ index, quantiles, length, width }) {
  return (
    ((quantiles[index + 1] - quantiles[index]) * length) / width >
    MIN_OUTLIER_WIDTH
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
// TODO: big outliers makes it less likely that other quantiles would be
// marked as outliers, since the `width` would be very high???
const MIN_OUTLIER_WIDTH = 2

// Find the highest quantile index where a majority of the remaining quantiles
// are outliers.
// This method works well with:
//  - Unsmoothed distributions where some outlier quantiles might be narrower
//    due to statistical imprecision
//  - Both fat and slim outliers tails
//  - Removing small aggregate of outliers, while still keeping much bigger ones
const getOutliersIndex = function (outliersChecks, length) {
  // eslint-disable-next-line fp/no-let
  let totalOutliers = outliersChecks.filter(Boolean).length

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < length; index += 1) {
    const outlierLeft = length - index
    const outlierRatio = totalOutliers / outlierLeft

    // eslint-disable-next-line max-depth, no-magic-numbers
    if (outlierRatio >= 0.5) {
      return index
    }

    // eslint-disable-next-line max-depth
    if (outliersChecks[index]) {
      // eslint-disable-next-line fp/no-mutation
      totalOutliers -= 1
    }
  }
}
