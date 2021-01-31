import now from 'precise-now'

// We keep track of:
//  - The total duration spent on each combination, to know whether it should
//    keep being measured.
//  - The mean duration of a sample, to know whether measuring an additional
//    sample would fit within the allowed `duration`
export const getSampleStart = function () {
  return now()
}

export const addSampleDuration = function (combination, sampleStart) {
  const sampleDurationLast = now() - sampleStart
  const totalDuration = combination.totalDuration + sampleDurationLast
  const sampleDurationMean = totalDuration / combination.allSamples

  return {
    ...combination,
    sampleDurationLast,
    totalDuration,
    sampleDurationMean,
  }
}
