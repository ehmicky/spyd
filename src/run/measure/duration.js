import now from 'precise-now'

// Keep track of the mean duration of a sample, to estimate the duration left
// based on the current `rmoe` and `precision`.
// During calibration, this can be quite changing, so we only keep the last
// sample then.
export const getInitialDurationState = function () {
  return { totalDuration: 0 }
}

export const startSample = function () {
  return now()
}

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
