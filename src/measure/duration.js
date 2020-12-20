import now from 'precise-now'

import { getSum } from '../stats/sum.js'

// Update the benchmark end in the progress reporting.
// When a combination ends, we stop including its remaining duration. This
// allows `benchmarkEnd` to adjust progressively at the end of the benchmark as
// each combination ends.
// If a task is slower than its `duration`, `benchmarkEnd` might increase. In
// that case, we make `benchmarkEnd` freeze for a moment instead of making it
// jump up.
export const updateBenchmarkEnd = function (
  remainingCombinations,
  progressState,
) {
  const remainingDuration = getSum(
    remainingCombinations.map(getRemainingDuration),
  )
  const benchmarkEnd = now() + remainingDuration
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  progressState.benchmarkEnd =
    progressState.benchmarkEnd === undefined
      ? benchmarkEnd
      : Math.min(progressState.benchmarkEnd, benchmarkEnd)
}

const getRemainingDuration = function ({ maxDuration, totalDuration }) {
  return Math.max(maxDuration - totalDuration, 0)
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
  const totalDuration = combination.totalDuration + sampleDurationLast
  const allSamples = combination.allSamples + 1
  const sampleDurationMean = totalDuration / allSamples

  return {
    ...combination,
    totalDuration,
    allSamples,
    sampleDurationLast,
    sampleDurationMean,
  }
}
