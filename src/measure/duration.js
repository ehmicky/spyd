import now from 'precise-now'

// Retrieve initial `durationState`
export const getInitialDurationState = function () {
  return { totalDuration: 0 }
}

// We keep track of:
//  - The total duration spent on each combination, to know whether it should
//    keep being measured.
//  - The mean duration of a sample, to estimate the duration left based on
//    the current `rmoe` and `precision`
export const startSample = function (stopState, { sampleDurationMean }) {
  const sampleStart = now()
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(stopState, { sampleStart, sampleDurationMean })
  return sampleStart
}

// During calibration (`samples < 2`), `totalDuration` and `sampleDurationMean`
// can be quite changing, so we only keep the last sample then.
export const endSample = function ({
  durationState: { totalDuration },
  stats: { samples },
  sampleStart,
  stopState,
}) {
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleStart
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleDurationMean

  const sampleDurationLast = now() - sampleStart

  if (samples < 2) {
    return {
      totalDuration: sampleDurationLast,
      sampleDurationMean: sampleDurationLast,
    }
  }

  const totalDurationA = totalDuration + sampleDurationLast
  const sampleDurationMean = totalDurationA / samples
  return { totalDuration: totalDurationA, sampleDurationMean }
}
