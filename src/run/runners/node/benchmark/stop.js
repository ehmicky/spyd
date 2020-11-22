import now from 'precise-now'

// We perform benchmarking iteratively until either:
//  - `maxTimes` measurements have been taken
//  - `maxDuration` nanoseconds have elapsed
// We ensure at least one measurement is taken, unless `maxTimes` is `0` (used
// when computing the benchmarkCost)
export const shouldStopLoop = function (maxTimes, times, runEnd) {
  return (
    (maxTimes !== undefined && times.length >= maxTimes) ||
    (runEnd !== undefined && now() + times[times.length - 1] >= runEnd)
  )
}
