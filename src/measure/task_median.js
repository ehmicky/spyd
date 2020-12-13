import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'
import { getMediansMedian } from '../stats/quantile.js'

// Retrieve an approximation of the task's median measure.
export const getTaskMedian = function (processMedians, mainMeasures, repeat) {
  return getMediansMedian({
    medians: processMedians,
    array: mainMeasures,
    precision: TASK_MEDIAN_PRECISION,
    threshold: OUTLIERS_THRESHOLD,
    divideBy: repeat,
  })
}

const TASK_MEDIAN_PRECISION = 1e2
