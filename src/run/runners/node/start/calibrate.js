import now from 'precise-now'

// Computes the duration to retrieve timestamps.
// This is used to compute `measureCost` and `resolution`, which are used for
// `repeat`.
export const getCalibrations = function (calibrate) {
  const end = now() + calibrate

  const calibrations = []
  // eslint-disable-next-line fp/no-let, init-declarations
  let start

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line fp/no-mutation
    start = now()
    const calibration = now() - start
    // eslint-disable-next-line fp/no-mutating-methods
    calibrations.push(calibration)
  } while (start < end)

  return calibrations
}
