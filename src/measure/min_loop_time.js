import timeResolution from 'time-resolution'

// If a task duration is too close to `nowBias`, the variance will be mostly due
// to the timestamp function itself.
// Also if a task duration is too close to the minimum system time resolution,
// it will lack precision.
// To fix this we measure the task in a loop to increase its running time.
// We then perform an arithmetic mean.
// `minLoopTime` is the minimum time under which we consider a task should do
// this.
export const getMinLoopTime = function (nowBias, duration) {
  const minPrecisionTime = TIME_RESOLUTION * MIN_PRECISION
  const minNowBiasTime = nowBias * MIN_NOW_BIAS
  const maxTotalDuration = duration * MAX_TOTAL_DURATION_RATIO
  return Math.min(Math.max(minPrecisionTime, minNowBiasTime), maxTotalDuration)
}

const TIME_RESOLUTION = timeResolution()
// How many times slower the task loop must be compared to the time resolution.
// A lower value makes measurements closer to the time resolution, making them
// less precise.
// A higher value increases the task loop time, creating fewer loops.
const MIN_PRECISION = 1e2
// How many times slower the task loop must be compared to `nowBias`.
// A lower value decreases precision as the variance of `nowBias` contributes
// more to the overall variance.
// A higher value increases the task loop time, creating fewer loops.
const MIN_NOW_BIAS = 1e2
// Maximum percentage of the total tas duration a single loop is allowed to
// last.
// This ensures that, if `nowBias` is high, combinations can still work without
// setting a very high total `duration`.
// A higher value makes it more likely for tasks to timeout.
// A lower value decreases the impact of `MIN_PRECISION` and `MIN_NOW_BIAS`.
const MAX_TOTAL_DURATION_RATIO = 0.1
