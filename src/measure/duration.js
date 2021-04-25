import now from 'precise-now'

// Retrieve initial `durationState`
export const getInitialDurationState = function () {
  return { totalDuration: 0 }
}

export const startSample = function () {
  return now()
}

// We keep track of:
//  - The total duration spent on each combination, to know whether it should
//    keep being measured.
//  - The mean duration of a sample, to estimate the duration left based on
//    the current `rmoe` and `precision`
// During calibration, `totalDuration` and `sampleDurationMean` can be quite
// changing, so we only keep the last sample then.
export const endSample = function (
  sampleStart,
  { totalDuration },
  { samples },
) {
  const sampleDuration = now() - sampleStart

  if (samples === 0) {
    return { totalDuration, sampleDurationMean: sampleDuration }
  }

  const totalDurationA = totalDuration + sampleDuration
  const sampleDurationMean = totalDurationA / samples
  return { totalDuration: totalDurationA, sampleDurationMean }
}
