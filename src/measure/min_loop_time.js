import { getResolution } from './resolution.js'

// If a task duration is too close to `measureCost`, the variance will be mostly
// due to the timestamp function itself.
// Also if a task duration is too close to the minimum system time resolution,
// it will lack precision.
// To fix this we measure the task in a loop to increase its running time.
// We then perform an arithmetic mean.
// `minLoopTime` is the minimum time under which we consider a task should do
// this.
export const getMinLoopTime = function ({
  measureCost,
  measureCostMeasures,
  duration,
}) {
  const resolution = getResolution(measureCostMeasures)
  const minResolutionDuration = getMinResolutionDuration(resolution)
  const minMeasureCostDuration = measureCost * MIN_MEASURE_COST
  const maxTotalDuration = duration * MAX_TOTAL_DURATION_RATIO
  return Math.min(
    Math.max(minResolutionDuration, minMeasureCostDuration),
    maxTotalDuration,
  )
}

const getMinResolutionDuration = function (resolution) {
  return resolution * MIN_RESOLUTION_PRECISION
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
