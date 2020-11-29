// Estimate how many times to repeat the repeat loop.
// This is performed continuously based on the previous measures because fast
// functions get optimized by runtimes after they are executed several times in
// a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
export const getRepeat = function ({
  repeat,
  median,
  repeatCost,
  measureCost,
  resolution,
  processGroupDuration,
}) {
  const minLoopDuration = getMinLoopDuration({
    measureCost,
    resolution,
    processGroupDuration,
  })

  // When computing `measureCost`
  if (minLoopDuration === 0) {
    return repeat
  }

  // When computing `repeatCost`, `median` might initially be `0`
  if (repeatCost === 0 && median === 0) {
    return repeat * FAST_LOOP_BIAS_RATE
  }

  return Math.ceil(minLoopDuration / (median + repeatCost))
}

const FAST_LOOP_BIAS_RATE = 10

// If a task duration is too close to `measureCost`, the variance will be mostly
// due to the timestamp function itself.
// Also if a task duration is too close to the minimum system resolution,
// it will lack precision.
// To fix this we measure the task in a loop to increase its running duration.
// We then perform an arithmetic mean.
// `minLoopDuration` is the minimum duration under which we consider a task
// should do this.
const getMinLoopDuration = function ({
  measureCost,
  resolution,
  processGroupDuration,
}) {
  const minResolutionDuration = resolution * MIN_RESOLUTION_PRECISION
  const minMeasureCostDuration = measureCost * MIN_MEASURE_COST
  const maxTotalDuration = processGroupDuration * MAX_TOTAL_DURATION_RATIO
  return Math.min(
    Math.max(minResolutionDuration, minMeasureCostDuration),
    maxTotalDuration,
  )
}

// How many times slower the task loop must be compared to the resolution.
// A lower value makes measurements closer to the resolution, making them
// less precise.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_RESOLUTION_PRECISION = 1e2
// How many times slower the task loop must be compared to `measureCost`.
// A lower value decreases precision as the variance of `measureCost`
// contributes more to the overall variance.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_MEASURE_COST = 1e2
// Maximum percentage of the total tas duration a single loop is allowed to
// last.
// This ensures that, if `measureCost` is high, combinations can still work
// without setting a very high total `duration`.
// A higher value makes it more likely for tasks to timeout.
// A lower value decreases the impact of `MIN_PRECISION` and `MIN_MEASURE_COST`.
const MAX_TOTAL_DURATION_RATIO = 0.1
