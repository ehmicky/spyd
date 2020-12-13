import { mergeSort } from '../stats/merge.js'
import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'
import { getApproximateMedian, getMedian } from '../stats/quantile.js'

// Retrieve an approximation of the task's median measure.
// This is based on a median of the median measures of the previous processes.
// Since sorting big arrays is very slow, we only sort a sample of them.
export const getTaskMedian = function (processMedians, loopDurations, repeat) {
  const medianLoopDuration = getApproximateMedian(
    loopDurations,
    CHILD_MEASURES_SORT_MAX,
    OUTLIERS_THRESHOLD,
  )
  const processTaskMedian = medianLoopDuration / repeat
  mergeSort(processMedians, [processTaskMedian])
  const taskMedian = getMedian(processMedians, 1)
  return taskMedian
}

// Size of the sorting sample.
// A lower value will make `repeat` vary more, which will increase the overall
// variance.
// A higher value will increase the time to sort by `O(n * log(n))`
const CHILD_MEASURES_SORT_MAX = 1e2
