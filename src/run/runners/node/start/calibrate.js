import now from 'precise-now'

// Computes the duration to retrieve timestamps.
// This is used to compute `measureCost` and `resolution`, which are used for
// `repeat`.
export const getCalibrations = function (calibrate) {
  return Array.from({ length: calibrate }, getCalibration)
}

// We use a separate function from `getDuration()` because this must only use
// the non-repeated part
const getCalibration = function () {
  return -now() + now()
}
