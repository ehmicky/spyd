import { getMediansMedian } from '../stats/median.js'
import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'

// Retrieve an approximation of the task's median measure.
export const getTaskMedian = function (processMedians, mainMeasures, repeat) {
  const taskMedian = getMediansMedian({
    medians: processMedians,
    array: mainMeasures,
    precision: TASK_MEDIAN_PRECISION,
    threshold: OUTLIERS_THRESHOLD,
    divideBy: repeat,
  })
  return [processMedians, taskMedian]
}

const TASK_MEDIAN_PRECISION = 1e2
