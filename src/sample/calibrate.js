// The number of `repeat` loops is estimated using the measures:
//  - Since those are based on the number of `repeat` loops themselves, there
//    is a feedback loop.
//  - This creates an initial calibration phase where `repeat` increases from
//    `1` to a stable number which does not vary much anymore.
// During calibration, `repeat` is not calibrated and measures can be greatly
// both inaccurate and imprecise.
//   - Therefore we remove the measures taken during calibration.
//   - In case there is not enough duration to finish calibration, we keep only
//     the last sample measures.
// We only reset cumulated stats.
//   - We do not reset stats which only use the last sample when those
//     cumulated stats are reset, such as `stats` and `repeat`.
export const calibrateReset = function ({
  calibrated,
  measures,
  bufferedMeasures,
  samples,
  loops,
  times,
}) {
  if (calibrated) {
    return { measures, bufferedMeasures, samples, loops, times }
  }

  return { measures: [], bufferedMeasures: [], samples: 0, loops: 0, times: 0 }
}

// Decides when calibration has ended.
// Based on the difference between `repeat` and `newRepeat`.
// Also, we always exclude the first sample:
//  - It always runs the task exactly once. This is the task's cold start, which
//    is usually much slower due to engine optimization and/or memoization.
//  - The big difference of performance makes stats very imprecise.
//  - It hinders `repeat` calibration because it might indicate that the first
//    sample needs no `repeat` loop (due to being much slower than it really is)
//    while it actually does.
export const getCalibrated = function ({
  calibrated,
  repeat,
  newRepeat,
  allSamples,
  duration,
  sampleMedian,
  minLoopDuration,
}) {
  return (
    calibrated ||
    isFastMode({ duration, sampleMedian, minLoopDuration }) ||
    (allSamples !== 1 && newRepeat / repeat <= MAX_REPEAT_DIFF)
  )
}

// When `duration` is `1` and combination is slow, we do not calibrate.
//   - Otherwise, users would perceive that the combination has run twice.
const isFastMode = function ({ duration, sampleMedian, minLoopDuration }) {
  return duration === 1 && sampleMedian > minLoopDuration * FAST_MODE_MIN_RATE
}

// Combinations with a first duration slower than this will stop right away,
// i.e. their cold start will be reported.
// We decide what a slow combination is by using a multiple of
// `minLoopDuration`. This allows not relying on hardcoded durations, making it
// work on machines of all speed. Also, this ensures that we are not skipping
// a `repeat` calibration due to a cold start.
// If the runner does not support repeat loops, `minLoopDuration` will be 0,
// i.e. cold start will always be included.
const FAST_MODE_MIN_RATE = 1e2

// To end calibration, `repeat` must vary once less than this percentage.
// It also ends when `repeat` is not increasing anymore.
// A higher number will include more uncalibrated measures, making the results
// more inaccurate and imprecise.
// A lower number will make calibration last longer, making combinations with
// low `duration` most likely to only use one sample.
// We also need to make sure an increase due to `FAST_MEDIAN_RATE` is below that
// threshold.
const MAX_REPEAT_DIFF = 1.1
