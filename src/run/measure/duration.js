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

// We keep track of the overall duration of measuring.
// The purpose is user debugging. This differs from:
//  - `durationState.totalDuration`, meant for system calibration.
//     - This includes `before|after`.
//     - This is not reset during calibration.
//  - `previewState.combinationStart|End`, meant for user preview.
//     - This focuses on user code, not system code.
//        - E.g. this excludes `start|end` and `minLoopDuration`.
export const startRunDuration = function () {
  return now()
}

export const endRunDuration = function (startStat, stats) {
  const runDuration = now() - startStat
  return { ...stats, runDuration }
}
