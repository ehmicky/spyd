import now from 'precise-now'

// We keep track of:
//  - The total duration spent on each combination, to know whether it should
//    keep being measured.
//  - The mean duration of a sample, to know whether measuring an additional
//    sample would fit within the allowed `duration`
export const startSample = function (stopState, sampleDurationMean) {
  const sampleStart = now()
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(stopState, { sampleStart, sampleDurationMean })
  return sampleStart
}

export const endSample = function ({
  stopState,
  combination: { allSamples },
  sampleStart,
  totalDuration,
}) {
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleStart
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleDurationMean

  const sampleDurationLast = now() - sampleStart
  const totalDurationA = totalDuration + sampleDurationLast
  const sampleDurationMean = totalDurationA / allSamples
  return { totalDuration: totalDurationA, sampleDurationMean }
}
