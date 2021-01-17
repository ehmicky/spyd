import now from 'precise-now'

// Measures how long it takes to get a single sample's results.
// This is used to compute `maxLoops` to make the average sample last a specific
// duration.
// This includes the duration to perform `beforeEach`, `afterEach` and doing
// IPC so that the actual sample duration does not deviate too much if one of
// those happened to be slow.
// We only keep the last `measureDuration` instead of taking the median of all
// previous ones, so that `measureDuration` quickly adapts to machine slowdowns.
export const getMeasureDurationStart = function () {
  return now()
}

export const getMeasureDurationLast = function (measureDurationStart) {
  return now() - measureDurationStart
}

export const getMeasureDuration = function (measureDurationLast, newLoops) {
  return measureDurationLast / newLoops
}
