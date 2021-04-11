import { hasMaxMeasures } from '../sample/params.js'

// Check if combination should keep being measured.
// We ensure each combination is measured at least once by checking
// `loops === 0`
// A combination does not time out even when slower than the `duration`
// configuration property:
//  - Timing out requires killing process, which might skip some resources
//    cleanup (afterEach and afterAll)
//  - The `duration` might be adjusted for a specific machine that is faster
//    than others. This might make slower machines time out.
//  - This allows `duration: 1` to be used to measure each combination once
// Combination duration does not include the duration spent starting, ending
// nor exiting them because:
//  - Adding imports to a task should not change the task's number of samples
//  - Adding slow-to-start tasks should not change other tasks number of samples
// With the `exec` command, we run each combination exactly once, even if
// not calibrated.
// We wait for calibration, for any `duration`.
// When `duration` is `1`, we only wait for calibration.
// The `duration` configuration property is for each combination, not the whole
// benchmark. Otherwise:
//  - Adding/removing combinations would change the duration (and results) of
//    others
//  - This includes using the `include|exclude` configuration properties
export const isRemainingCombination = function (
  {
    sampleState: { allSamples, measures },
    durationState: { totalDuration, sampleDurationMean },
  },
  { duration, exec, stopState: { stopped } },
) {
  return (
    !stopped &&
    hasDurationLeft({
      allSamples,
      measures,
      duration,
      exec,
      totalDuration,
      sampleDurationMean,
    })
  )
}

const hasDurationLeft = function ({
  allSamples,
  measures,
  duration,
  exec,
  totalDuration,
  sampleDurationMean,
}) {
  if (exec) {
    return allSamples === 0
  }

  return (
    measures.length === 0 ||
    hasTimeLeft({ measures, duration, sampleDurationMean, totalDuration })
  )
}

const hasTimeLeft = function ({
  measures,
  duration,
  totalDuration,
  sampleDurationMean,
}) {
  return (
    !hasMaxMeasures(measures) &&
    duration !== 1 &&
    totalDuration + sampleDurationMean < duration
  )
}
