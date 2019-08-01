import { sortNumbers } from '../utils.js'

export const normalizeResult = function(times, count) {
  sortNumbers(times)

  const result = removeOutliers(times, count)
  return result
}

// Due to background processes (such as garbage collection) in JavaScript
// engines, the execution becomes periodically much slower for very short
// amounts of time. Those slow downs are due to the engine and not the function
// being measured, so we remove them.
// We do it by removing the slowest 15%.
const removeOutliers = function(times, count) {
  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const timesA = times.slice(0, outliersLimit)
  const countA = Math.ceil(count * (1 - OUTLIERS_THRESHOLD))
  return { times: timesA, count: countA }
}

export const OUTLIERS_THRESHOLD = 0.15
