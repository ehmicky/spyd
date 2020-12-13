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
  repeat,
  median,
  sampleType,
  measureCost,
  resolution,
  runnerRepeats,
}) {
  // If the runner does not supports `repeat`, it is always set to `1`
  // We should not use a repeat loop when estimating measureCost since
  // measureCost only happens once per repeat loop
  if (sampleType === 'measureCost' || !runnerRepeats) {
    return 1
  }

  if (median === 0) {
    return repeat * FAST_MEDIAN_RATE
  }

  const minResolutionDuration = resolution * MIN_RESOLUTION_PRECISION
  const minMeasureCostDuration = measureCost * MIN_MEASURE_COST
  return Math.ceil(
    Math.max(minResolutionDuration, minMeasureCostDuration) / median,
  )
}

// `median` can be 0 when the task is too close to `measureCost` or `resolution`
// In that case, we multiply the `repeat` with a fixed rate.
const FAST_MEDIAN_RATE = 10
// How many times slower the repeated median must be compared to the resolution.
// A lower value makes measures closer to the resolution, making them less
// precise.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_RESOLUTION_PRECISION = 1e2
// How many times slower the repeated median must be compared to `measureCost`.
// Ensure `repeat` is high enough to decrease the impact of `measureCost`.
// A lower value decreases precision as the variance of `measureCost`
// contributes more to the overall variance.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_MEASURE_COST = 1e2

// If the runner does not support `repeat`, its value is:
//  - `undefined` in the runner
//  - always `1` in the parent process
export const getChildRepeat = function (repeat, runnerRepeats) {
  if (!runnerRepeats) {
    return
  }

  return repeat
}
