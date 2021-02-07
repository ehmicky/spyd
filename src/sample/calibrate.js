// The number of `repeat` loops is estimated using the measures:
//  - Since those are based on the number of `repeat` loops themselves, there
//    is a feedback loop.
//  - This creates an initial calibration phase where `repeat` increases from
//    `1` to a stable number which does not vary much anymore.
// During calibration, `repeat` is not calibrated and measures can be greatly
// both inaccurate and imprecise.
//   - Therefore we remove the measures taken during calibration.
//   - We also do not report them, including in previews.
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
export const calibrateReset = function ({
  calibrated,
  repeat,
  newRepeat,
  coldStart,
  measures,
  bufferedMeasures,
  samples,
  loops,
  times,
}) {
  const calibratedA = getCalibrated({
    calibrated,
    repeat,
    newRepeat,
    coldStart,
  })

  if (calibratedA) {
    return {
      calibrated: calibratedA,
      measures,
      bufferedMeasures,
      samples,
      loops,
      times,
    }
  }

  return {
    calibrated: calibratedA,
    measures: [],
    bufferedMeasures: [],
    samples: 0,
    loops: 0,
    times: 0,
  }
}

const getCalibrated = function ({ calibrated, repeat, newRepeat, coldStart }) {
  return calibrated || (!coldStart && newRepeat / repeat <= MAX_REPEAT_DIFF)
}

// To end calibration, `repeat` must vary once less than this percentage.
// It also ends when `repeat` is not increasing anymore.
// A higher number will include more uncalibrated measures, making the results
// more inaccurate and imprecise.
// A lower number will make calibration last longer, making combinations with
// low `duration` most likely to only use one sample.
// We also need to make sure an increase due to `FAST_MEDIAN_RATE` is below that
// threshold.
const MAX_REPEAT_DIFF = 1.1
