import now from 'precise-now'

// We perform benchmarking iteratively until `maxDuration` nanoseconds have
// elapsed.
// We ensure at least one measurement is taken.
export const shouldStopLoop = function (runEnd) {
  return now() >= runEnd
}
