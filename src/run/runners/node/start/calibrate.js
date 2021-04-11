import now from 'precise-now'

import { getDurationAsync } from '../measure/async.js'
import { getDurationSync } from '../measure/sync.js'

// Computes the duration to retrieve timestamps.
// This is used to compute `measureCost` and `resolution`, which are used for
// `repeat`.
// We re-use the same function used for benchmark because:
//  - It ensures the actual logic being used is measured
//  - It warms it, removing cold starts, which makes it more precise
export const getCalibrations = async function (calibrate, task) {
  const end = now() + calibrate
  const calibrations = []
  await addCalibrations(task, calibrations, end)
  return calibrations
}

const addCalibrations = async function ({ main, async }, calibrations, end) {
  if (async) {
    await addCalibrationsAsync(main, calibrations, end)
    return
  }

  addCalibrationsSync(main, calibrations, end)
}

const addCalibrationsAsync = async function (main, calibrations, end) {
  // eslint-disable-next-line fp/no-loops
  while (now() < end) {
    // eslint-disable-next-line no-await-in-loop
    const calibration = await getDurationAsync(main, [])
    // eslint-disable-next-line fp/no-mutating-methods
    calibrations.push(calibration)
  }
}

const addCalibrationsSync = function (main, calibrations, end) {
  // eslint-disable-next-line fp/no-loops
  while (now() < end) {
    const calibration = getDurationSync(main, [])
    // eslint-disable-next-line fp/no-mutating-methods
    calibrations.push(calibration)
  }
}
