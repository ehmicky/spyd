// The number of `repeat` loops is estimated using the measures. Since those are
// based on the number of `repeat` loops themselves, there is a feedback loop.
// This creates an initial callibration phase (`repeatInit`) where `repeat`
// increases from `1` to a stable number which does not vary much anymore.
// During `repeatInit`, `repeat` is not callibration and measures can be greatly
// both inaccurate and imprecise.
// Therefore we remove the measures taken during `repeatInit`.
// In case there is not enough duration to finish `repeatInit`, we keep only
// the last sample measures.
// We only reset cumulated stats like `measures`, `bufferedMeasures`,
// `measureDurations`, `samples`, `loops` and `times`
// We do not reset stats which only use the last sample when those cumulated
// stats are reset, such as `stats` and `repeat`.
export const repeatInitReset = function ({
  repeatInit,
  measures,
  bufferedMeasures,
  measureCosts,
  measureDurations,
  samples,
  loops,
  times,
}) {
  if (!repeatInit || samples === 0) {
    return [
      measures,
      bufferedMeasures,
      measureCosts,
      measureDurations,
      samples,
      loops,
      times,
    ]
  }

  return [[], [], [], [], 0, 0, 0]
}

// Decides when `repeatInit` has stopped.
// Based on the difference between `repeat` and `newRepeat`.
export const getRepeatInit = function ({ repeatInit, repeat, newRepeat }) {
  return repeatInit && newRepeat / repeat > MAX_REPEAT_DIFF
}

// To stop `repeatInit`, `repeat` must vary once less than this percentage.
// It also stops when `repeat` stops increasing.
// A higher number will include more uncallibrated measures, making the results
// more inaccurate and imprecise.
// A lower number will make `repeatInit` last longer, making combinations with
// low `duration` most likely to only use once sample.
// We also need to make sure an increase due to `FAST_MEDIAN_RATE` is below that
// threshold.
const MAX_REPEAT_DIFF = 1.1
