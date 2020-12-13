import { mergeSort } from '../stats/merge.js'
import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'
import { getApproximateMedian, getMedian } from '../stats/quantile.js'

// This function estimates `measureCost` by making runners measure empty tasks.
// That cost must be computed separately for each combination since they might
// vary depending on the task, input or system. For example, tasks with more
// iterations per process have more time to optimize `measureCost`, which is
// usually faster then.
// This is based on a median of the median measures of the previous processes.
// Since sorting big arrays is very slow, we only sort a sample of them.
export const getMeasureCost = function (measureCosts, emptyMeasures) {
  const processMeasureCost = getApproximateMedian(
    emptyMeasures,
    EMPTY_MEASURES_SORT_MAX,
    OUTLIERS_THRESHOLD,
  )
  mergeSort(measureCosts, [processMeasureCost])
  return getMedian(measureCosts, 1)
}

// Size of the sorting sample.
// A lower value will make `repeat` vary more, which will increase the overall
// variance.
// A higher value will increase the time to sort by `O(n * log(n))`
const EMPTY_MEASURES_SORT_MAX = 1e2
