// Return where a group of `quantilePercentage` quantiles reducing the max-min
// width percentage by a specific `widthPercentage` should be considered
// outliers
export const isOutlier = function (
  widthPercentage,
  quantilePercentage,
  outliersThreshold,
) {
  return (
    getOutliersLikelihood(widthPercentage, quantilePercentage) >
    outliersThreshold
  )
}

// `quantilePercentage` should not be 1 or 0.
// `widthPercentage` should not be 1.
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

// Computes THRESHOLDS_BASE based on a 50% width reduction.
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
  const maxExponent = (THRESHOLDS_COUNT - 1) / 2
  return THRESHOLDS_SPREAD ** (1 / maxExponent)
}

const THRESHOLDS_FACTOR = getThresholdsFactor()

// Retrieve each `outliersThreshold`.
// Each next one is divided by THRESHOLDS_SPREAD.
// There are THRESHOLDS_COUNT of them in total.
// Their center value is OUTLIERS_BASE_THRESHOLD.
const getThresholds = function () {
  return Array.from({ length: THRESHOLDS_COUNT }, getThreshold)
}

const getThreshold = function (_, index) {
  const thresholdExponent = (THRESHOLDS_COUNT - 1) / 2 - index
  return THRESHOLDS_BASE * THRESHOLDS_FACTOR ** thresholdExponent
}

export const THRESHOLDS = getThresholds()
