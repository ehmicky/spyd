import now from 'precise-now'

import { getIncrementalMedian } from '../stats/median.js'

// Measures how long it takes to get a single sample's results.
// This is used to compute `maxLoops` to make the average sample last a specific
// duration.
// This includes the duration to perform `beforeEach`, `afterEach` and doing
// IPC so that the actual sample duration does not deviate too much if one of
// those happened to be slow.
export const getMeasureDurationStart = function () {
  return now()
}

export const getMeasureDurationLast = function (measureDurationStart) {
  return now() - measureDurationStart
}

// We keep track of all previous `measureDuration` and take a median of them.
// This ensures the `measureDuration` is stable.
export const getMeasureDuration = function (
  measureDurations,
  measureDurationLast,
  newLoops,
) {
  const measureDuration = measureDurationLast / newLoops
  return getIncrementalMedian(measureDurations, measureDuration)
}
