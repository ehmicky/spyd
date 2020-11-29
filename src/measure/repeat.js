// Estimate how many times to repeat the repeat loop.
// This is performed continuously based on the previous measures because fast
// functions get optimized by runtimes after they are executed several times in
// a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
// The repeat loop is used to minimize the impact on the measures of both:
//  - `measureCost`
//  - low resolutions
// It repeats the task without the `measureCost` and perform an arithmetic mean.
export const getRepeat = function ({
  repeat,
  median,
  sampleType,
  repeatCost,
  measureCost,
  resolution,
  processGroupDuration,
}) {
  if (sampleType === 'measureCost') {
    return 1
  }

  if (median === 0) {
    return repeat * FAST_MEDIAN_RATE
  }

  const minResolutionDuration = resolution * MIN_RESOLUTION_PRECISION
  const minMeasureCostDuration = measureCost * MIN_MEASURE_COST
  const minCostRepeat =
    Math.max(minResolutionDuration, minMeasureCostDuration) / median
  const maxTotalDuration = processGroupDuration * MAX_TOTAL_DURATION_RATIO
  const minDurationRepeat =
    (maxTotalDuration - measureCost + repeatCost) / (median + repeatCost)
  return Math.ceil(Math.min(minCostRepeat, minDurationRepeat))
}

// `median` can be 0 when the task is too close to `repeatCost`,
// `measureCost` or `resolution`.
// In that case, we multiply the `repeat` with a fixed rate. This fixes
// the problem with `measureCost` and `resolution` but not with `repeatCost`.
const FAST_MEDIAN_RATE = 10
// How many times slower the repeated median must be compared to the resolution.
// A lower value makes measures closer to the resolution, making them less
// precise.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_RESOLUTION_PRECISION = 1e2
// How many times slower the repeated median must be compared to `measureCost`.
// A lower value decreases precision as the variance of `measureCost`
// contributes more to the overall variance.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_MEASURE_COST = 1e2
// Maximum percentage of the total processGroupDuration a single loop is allowed
// to last.
// This ensures that, if `measureCost` is high, combinations can still work
// without setting a very high total `duration`.
// A higher value makes it more likely for tasks to timeout.
// A lower value decreases the impact of `MIN_RESOLUTION_PRECISION` and
// `MIN_MEASURE_COST`.
const MAX_TOTAL_DURATION_RATIO = 0.1

// When computing `repeatCost`, the first repeat iteration is assumed to be the
// `measureCost` and is discarded. Only the next iterations are used for the
// `median`. This leads to two parameters:
//  - Inside the runner, we use `childRepeat`, which is `repeat` + 1, where
//    the additional `1` is the first iteration (`measureCost`)
//  - In the parent process, we discard that first iteration as `measureCost`
//    and use `repeat` without the additional `1`
export const getChildRepeat = function (repeat, sampleType) {
  if (sampleType !== 'repeatCost') {
    return repeat
  }

  return repeat + 1
}
