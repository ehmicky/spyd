import { getMediansMedian } from '../stats/median.js'
import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'

// Retrieve an approximation of the task's median measure.
export const getTaskMedian = function (taskMedians, mainMeasures, repeat) {
  const taskMedian = getMediansMedian({
    medians: taskMedians,
    array: mainMeasures,
    precision: TASK_MEDIAN_PRECISION,
    threshold: OUTLIERS_THRESHOLD,
    divideBy: repeat,
  })
  return [taskMedians, taskMedian]
}

const TASK_MEDIAN_PRECISION = 1e2
