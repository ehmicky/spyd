import now from 'precise-now'

import { preciseTimestamp } from '../../../measure/precise_timestamp.js'

// Start measuring a task
export const startMeasuring = function (maxDuration) {
  const measures = []
  const start = String(preciseTimestamp())
  const measureEnd = now() + maxDuration
  return { measures, start, measureEnd }
}
