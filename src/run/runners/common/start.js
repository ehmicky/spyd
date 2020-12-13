import now from 'precise-now'

import { preciseTimestamp } from '../../../measure/precise_timestamp.js'

// Start measuring a task
export const startMeasuring = function (maxDuration, empty) {
  const mainMeasures = []
  const emptyMeasures = empty ? [] : undefined
  const start = String(preciseTimestamp())
  const measureEnd = now() + maxDuration
  return { mainMeasures, emptyMeasures, start, measureEnd }
}
