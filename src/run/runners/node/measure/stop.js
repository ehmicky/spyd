import now from 'precise-now'

// We task measures iteratively until `maxDuration` nanoseconds have elapsed.
// We ensure at least one measurement is taken.
export const shouldStopLoop = function (measureEnd) {
  return now() >= measureEnd
}
