import {
  THRESHOLDS_BASE_AMOUNT,
  THRESHOLDS_COUNT,
  THRESHOLDS_SPREAD,
} from './constants.js'

// Return where a group of `quantilePercentage` quantiles reducing the max-min
// width percentage by a specific `widthPercentage` should be considered
// outliers
export const isOutlier = (widthPercentage, quantilePercentage, threshold) =>
  getOutliersLikelihood(widthPercentage, quantilePercentage) > threshold

// `quantilePercentage` should not be 1 or 0.
// `widthPercentage` should not be 1.
const getOutliersLikelihood = (widthPercentage, quantilePercentage) =>
  Math.log(1 - widthPercentage) / Math.log(1 - quantilePercentage)

// Computes THRESHOLDS_BASE based on a 50% width reduction.
// Should be kept as is. THRESHOLDS_BASE_AMOUNT should be changed to
// increase|decrease outliers instead.
const THRESHOLDS_BASE_WIDTH = 0.5

// Average outliers threshold
const THRESHOLDS_BASE = getOutliersLikelihood(
  THRESHOLDS_BASE_WIDTH,
  THRESHOLDS_BASE_AMOUNT,
)

// Computes the multiplying factor between each outlier threshold, so that they
// respect both THRESHOLDS_COUNT and THRESHOLDS_SPREAD.
const getThresholdsFactor = () => {
  const maxExponent = (THRESHOLDS_COUNT - 1) / 2
  return THRESHOLDS_SPREAD ** (1 / maxExponent)
}

const THRESHOLDS_FACTOR = getThresholdsFactor()

// Retrieve each threshold.
// Each next one is divided by THRESHOLDS_SPREAD.
// There are THRESHOLDS_COUNT of them in total.
// Their center value is THRESHOLDS_BASE.
const getThresholds = () =>
  Array.from({ length: THRESHOLDS_COUNT }, getThreshold)

const getThreshold = (_, index) => {
  const thresholdExponent = (THRESHOLDS_COUNT - 1) / 2 - index
  return THRESHOLDS_BASE * THRESHOLDS_FACTOR ** thresholdExponent
}

export const THRESHOLDS = getThresholds()
