import { v4 as uuidv4 } from 'uuid'

import { aggregateMeasuresEnd } from '../sample/aggregate.js'
import { addSideStats } from '../stats/compute.js'

// Initialize some combination properties
export const addInitProps = function (combination) {
  return {
    ...combination,
    id: uuidv4(),
    totalDuration: 0,
    sampleDurationLast: 0,
    sampleDurationMean: 0,
    measureDuration: 0,
    aggregateCountdown: 0,
    sampleMedian: 0,
    stats: { median: 0 },
    measures: [],
    bufferedMeasures: [],
    allSamples: 0,
    samples: 0,
    loops: 0,
    loopsLast: 0,
    times: 0,
    repeat: 1,
    calibrated: false,
    minLoopDuration: 0,
  }
}

// Retrieve final combination properties used for reporting
export const getFinalProps = function ({
  taskId,
  runnerId,
  systemId,
  measures,
  bufferedMeasures,
  stats,
  loops,
  times,
  samples,
  minLoopDuration,
}) {
  const statsA = aggregateMeasuresEnd({ measures, bufferedMeasures, stats })
  const statsB = addSideStats({
    stats: statsA,
    loops,
    times,
    samples,
    minLoopDuration,
  })
  return { taskId, runnerId, systemId, stats: statsB }
}
