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
export const isRemainingCombination = function ({
  duration,
  exec,
  totalDuration,
  sampleDurationMean,
  stopState: { stopped },
  sampleState: {
    stats: { loops },
    allSamples,
  },
}) {
  return (
    !stopped &&
    hasDurationLeft({
      loops,
      allSamples,
      duration,
      exec,
      totalDuration,
      sampleDurationMean,
    })
  )
}

const hasDurationLeft = function ({
  loops,
  allSamples,
  duration,
  exec,
  totalDuration,
  sampleDurationMean,
}) {
  if (exec) {
    return allSamples === 0
  }

  return (
    loops === 0 ||
    hasTimeLeft({ loops, duration, sampleDurationMean, totalDuration })
  )
}

const hasTimeLeft = function ({
  loops,
  duration,
  totalDuration,
  sampleDurationMean,
}) {
  return (
    loops < MAX_LOOPS &&
    duration !== 1 &&
    totalDuration + sampleDurationMean < duration
  )
}

// We end running samples when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8
