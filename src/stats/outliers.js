// The slowest times are due to external factors:
//   - OS or runtime background periodic processes (such as garbage collection)
//   - The first runs of a specific task in a given process are slow because
//     the runtimes did not optimize it yet
//   - The first processes have not reached the final stabilized `repeat` and
//     `maxDuration`, making them usually slower
export const removeOutliers = function (times, count) {
  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const timesA = times.slice(0, outliersLimit)
  const countA = Math.ceil(count * (1 - OUTLIERS_THRESHOLD))
  return { times: timesA, count: countA }
}

// How many outliers to remove.
// A lower value removes fewer outliers, which increases variance.
// A higher value removes more times, which decreases accuracy.
const OUTLIERS_THRESHOLD = 0.15
