import now from 'precise-now'

// We perform benchmarking iteratively until `maxDuration` nanoseconds have
// elapsed.
// We ensure at least one measurement is taken, unless `maxDuration` is `0`
// (used when computing the benchmarkCost)
export const shouldStopLoop = function (runEnd, lastTime) {
  return now() + lastTime >= runEnd
}
