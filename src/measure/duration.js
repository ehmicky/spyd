import now from 'precise-now'

// We keep track of:
//  - The total duration spent on each combination, to know whether it should
//    keep being measured.
//  - The mean duration of a sample, to know whether measuring an additional
//    sample would fit within the allowed `duration`
export const getSampleStart = function () {
  return now()
}

export const getSampleDuration = function (
  { allSamples },
  sampleStart,
  totalDuration,
) {
  const sampleDurationLast = now() - sampleStart
  const totalDurationA = totalDuration + sampleDurationLast
  const sampleDurationMean = totalDurationA / allSamples
  return { totalDuration: totalDurationA, sampleDurationMean }
}
