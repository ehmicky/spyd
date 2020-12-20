import now from 'precise-now'

// Compute when the benchmark should end.
// The `duration` configuration property is for each combination, not the whole
// benchmark. Otherwise:
//  - Adding/removing combinations would change the duration (and results) of
//    others
//  - This includes using the `include|exclude` configuration properties
export const getBenchmarkEnd = function (combinations, duration) {
  const benchmarkDuration = combinations.length * duration
  return now() + benchmarkDuration
}

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
  const combinationDuration =
    combination.combinationDuration + sampleDurationLast
  const allSamples = combination.allSamples + 1
  const sampleDurationMean = combinationDuration / allSamples

  return {
    ...combination,
    combinationDuration,
    allSamples,
    sampleDurationLast,
    sampleDurationMean,
  }
}
