import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'
import { getMediansMedian } from '../stats/quantile.js'

// This function estimates `measureCost` by making runners measure empty tasks.
// That cost must be computed separately for each combination since they might
// vary depending on the task, input or system. For example, tasks with more
// iterations per process have more time to optimize `measureCost`, which is
// usually faster then.
export const getMeasureCost = function (measureCosts, emptyMeasures) {
  return getMediansMedian({
    medians: measureCosts,
    array: emptyMeasures,
    precision: EMPTY_MEASURES_PRECISION,
    threshold: OUTLIERS_THRESHOLD,
  })
}

const EMPTY_MEASURES_PRECISION = 1e2
