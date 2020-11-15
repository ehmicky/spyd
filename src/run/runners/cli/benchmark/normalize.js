import { sortNumbers } from '../../../../utils/sort.js'

// Transform raw results into a result object that can be used by parent
export const normalizeResult = function (times) {
  sortNumbers(times)

  const result = removeOutliers(times)
  return result
}

// Due to background processes the execution becomes periodically much slower
// for very short amounts of time.
// Those slow downs are due to the engine and not the function being measured,
// so we remove them.
// We do it by removing the slowest 15%.
const removeOutliers = function (times) {
  const outliersLimit = Math.ceil(times.length * (1 - OUTLIERS_THRESHOLD))
  const timesA = times.slice(0, outliersLimit)
  return timesA
}

const OUTLIERS_THRESHOLD = 0.15
