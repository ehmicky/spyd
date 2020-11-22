import timeResolution from 'time-resolution'

// If a task duration is too close to `nowBias`, the variance will be mostly due
// to the timestamp function itself.
// Also if a task duration is too close to the minimum system time resolution,
// it will lack precision.
// To fix this we run the task in a loop to increase its running time. We then
// perform an arithmetic mean.
// `minTime` is the minimum time under which we consider a task should do this.
export const getMinTime = function (nowBias) {
  const minPrecisionTime = TIME_RESOLUTION * MIN_PRECISION
  const minNowBiasTime = nowBias * MIN_NOW_BIAS
  return Math.max(minPrecisionTime, minNowBiasTime)
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
