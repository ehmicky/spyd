// Due to OS or engines background processes (such as garbage collection), the
// execution becomes periodically much slower for very short amounts of time.
// Those slow downs are due to the OS or engine and not the function being
// measured, so we remove them.
// We do it by removing the slowest 15%.
export const removeOutliers = function (times, count) {
  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const timesA = times.slice(0, outliersLimit)
  const countA = Math.ceil(count * (1 - OUTLIERS_THRESHOLD))
  return { times: timesA, count: countA }
}

const OUTLIERS_THRESHOLD = 0.15
