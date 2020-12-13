import now from 'precise-now'

import { preciseTimestamp } from '../../../measure/precise_timestamp.js'

// Start measuring a task
export const startMeasuring = function (maxDuration, empty) {
  const measures = []
  const emptyMeasures = empty === undefined ? undefined : []
  const start = String(preciseTimestamp())
  const measureEnd = now() + maxDuration
  return { measures, emptyMeasures, start, measureEnd }
}
