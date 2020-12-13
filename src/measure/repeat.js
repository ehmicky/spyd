// Estimate how many times to repeat the repeat loop.
// This is performed continuously based on the previous measures because fast
// functions get optimized by runtimes after they are executed several times in
// a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
// The repeat loop is used to minimize the impact on the measures of both:
//  - `measureCost`
//  - low resolutions
// It repeats the task without the `measureCost` and perform an arithmetic mean.
// We purposely avoid using `processGroupDuration` (except for
// `measureDurationLeft`) so that increasing `duration` does not change measures
export const getRepeat = function ({
  lastRepeat,
  taskMedian,
  minLoopDuration,
  runnerRepeats,
}) {
  // If the runner does not supports `repeat`, it is always set to `1`
  // We should not use a repeat loop when estimating `measureCost` since
  // `measureCost` only happens once per repeat loop
  if (!runnerRepeats) {
    return 1
  }

  if (taskMedian === 0) {
    return lastRepeat * FAST_MEDIAN_RATE
  }

  return Math.ceil(minLoopDuration / taskMedian)
}

// `taskMedian` can be 0 when the task is too close to `minLoopDuration`.
// In that case, we multiply the `repeat` with a fixed rate.
const FAST_MEDIAN_RATE = 10

// If the runner does not support `repeat`, its value is:
//  - `undefined` in the runner
//  - always `1` in the parent process
export const getChildRepeat = function (repeat, runnerRepeats) {
  if (!runnerRepeats) {
    return
  }

  return repeat
}
