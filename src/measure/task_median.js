import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'
import { getApproximateMedian } from '../stats/quantile.js'

// Retrieve an approximation of the task's median measure.
// This is based on a median of the median measures of the previous processes.
// Since sorting big arrays is very slow, we only sort a sample of them.
export const getTaskMedian = function (childMeasures, processMedians) {
  const processMedian = getApproximateMedian(
    childMeasures,
    CHILD_MEASURES_SORT_MAX,
    OUTLIERS_THRESHOLD,
  )
  // eslint-disable-next-line fp/no-mutating-methods
  processMedians.push(processMedian)
  const taskMedian = getApproximateMedian(
    processMedians,
    PROCESS_MEDIANS_SORT_MAX,
    1,
  )
  return taskMedian
}

// Size of the sorting sample.
// A lower value will make `repeat` vary more, which will increase the overall
// variance.
// A higher value will increase the time to sort by `O(n * log(n))`
const CHILD_MEASURES_SORT_MAX = 1e3
// Same for computing the median or all previous processes' medians.
// This is lower because the variation between those values is lower.
const PROCESS_MEDIANS_SORT_MAX = 1e2
