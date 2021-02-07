// Estimate how many times to repeat the repeat loop.
// This is performed continuously based on the previous measures because fast
// functions get optimized by runtimes after they are executed several times in
// a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
// The repeat loop is used to minimize the impact on the measures of both:
//  - `measureCost`
//  - low resolutions
// It repeats the task without the `measureCost` and perform an arithmetic mean.
// We purposely avoid using `duration` so that increasing it does not change
// measures.
// We use the `sampleMedian` instead of `stats.median`:
//  - So that `repeat` adjusts to slowdowns of the task (for example due to
//    competing processes).
//  - It makes the initial calibration phase shorter. This leads to more
//    stable `max` and `deviation` stats.
export const handleRepeat = function ({
  repeat,
  sampleMedian,
  minLoopDuration,
  allSamples,
  calibrated,
}) {
  // If the runner does not supports `repeat`, it is always set to `1`.
  // We should not use a repeat loop when estimating `measureCost` since
  // `measureCost` only happens once per repeat loop
  if (minLoopDuration === 0) {
    return { newRepeat: 1, calibrated: true }
  }

  // `sampleMedian` can be 0 when the task is too close to `minLoopDuration`.
  // In that case, we multiply the `repeat` with a fixed rate.
  if (sampleMedian === 0) {
    return { newRepeat: repeat * FAST_MEDIAN_RATE, calibrated }
  }

  const newRepeatFloat = minLoopDuration / sampleMedian
  const newRepeat = Math.ceil(newRepeatFloat)

  if (calibrated) {
    return { newRepeat, calibrated }
  }

  const calibratedA = getCalibrated({
    repeat,
    newRepeat,
    newRepeatFloat,
    allSamples,
  })
  return { newRepeat, calibrated: calibratedA }
}

const FAST_MEDIAN_RATE = 10

// The number of `repeat` loops is estimated using the measures:
//  - Since those are based on the number of `repeat` loops themselves, there
//    is a feedback loop.
//  - This creates an initial calibration phase where `repeat` increases from
//    `1` to a stable number which does not vary much anymore.
// During calibration, `repeat` is not calibrated and measures can be greatly
// both inaccurate and imprecise.
//   - Therefore we remove the measures taken during calibration.
//   - We also do not report them, including in previews.
// Calibration happens only once, at the beginning:
//   - `calibrated` is initially `false`
//   - Once it becomes `true`, it never comes back to `false`
// We only reset cumulated stats.
//   - We do not reset stats which only use the last sample when those
//     cumulated stats are reset, such as `stats` and `repeat`.
// Calibrating will always remove the first sample (cold start):
//  - A downside is that this means cold starts will be included or not
//    depending on whether they are fast enough to use repeat loops.
//  - This can make it harder to compare some stats (especially `max`) between
//    combinations if some have repeat loops while others not.
//  - However, this problem is more general. Using repeat loops will always
//    change how the mean, min, max, standard deviation are computed since it
//    uses an arithmetic mean.
// The alternative solutions have bigger problems:
//  - Excluding all first samples, even without a repeat loop:
//     - This prevents running the combination only once, which is especially
//       problematic with `duration: 1`
//     - The first sample includes some useful stats since many functions are
//       only run once in real.
//     - This makes the first preview take longer to show up even if the
//       combination does not require any repeat loops.
//  - Excluding first samples except when there was not enough time to measure
//    more:
//     - This creates a big difference of stats (especially median and max)
//       depending on the `duration`
//     - This can lead to comparing combinations with and without the cold start
//       included in their stats
//  - Excluding first samples except when `duration: 1`
//     - Switching between `duration: 1` and others `duration` should show the
//       same results when lasting the same amount of time.
// Calibration is based on the difference between `repeat` and `newRepeat`.
const getCalibrated = function ({
  repeat,
  newRepeat,
  newRepeatFloat,
  allSamples,
}) {
  return (
    !isColdStart(allSamples, newRepeatFloat) &&
    newRepeat / repeat <= MAX_REPEAT_DIFF
  )
}

// The first sample (cold start) is usually much slower due to engine
// optimization and/or memoization. This can make hinder `repeat` calibration
// by indicating that the first sample needs no `repeat` loop (due to being
// much slower than it really is) while it actually does.
const isColdStart = function (allSamples, newRepeatFloat) {
  return allSamples === 0 && newRepeatFloat > MIN_REPEAT_COLD_START
}

// When the first sample is that close to using the repeat loop, we continue
// calibrating.
// A higher number gives more false negatives, while a lower numbers gives more
// false positives.
const MIN_REPEAT_COLD_START = 1e-2

// To end calibration, `repeat` must vary once less than this percentage.
// It also ends when `repeat` is not increasing anymore.
// A higher number will include more uncalibrated measures, making the results
// more inaccurate and imprecise.
// A lower number will make calibration last longer, making combinations with
// low `duration` most likely to only use one sample.
const MAX_REPEAT_DIFF = 1.1
