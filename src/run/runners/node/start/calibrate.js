import now from 'precise-now'

// Computes the duration to retrieve timestamps.
// This is used to compute `measureCost` and `resolution`, which are used for
// `repeat`.
export const getCalibrations = function (calibrate) {
  const calibrations = []

  // eslint-disable-next-line fp/no-loops
  while (calibrations.length !== calibrate) {
    addCalibration(calibrations)
  }

  return calibrations
}

const addCalibration = function (calibrations) {
  const calibration = -now() + now()

  if (calibration !== 0) {
    // eslint-disable-next-line fp/no-mutating-methods
    calibrations.push(calibration)
  }
}
