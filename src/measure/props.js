import { v4 as uuidv4 } from 'uuid'

import { getFinalStats } from '../sample/aggregate.js'

// Initialize some combination properties
export const addInitProps = function (combination) {
  return {
    ...combination,
    id: uuidv4(),
    totalDuration: 0,
    sampleDurationLast: 0,
    sampleDurationMean: 0,
    measureDurationLast: 0,
    measureDurations: [],
    aggregateCountdown: 0,
    stats: { median: 0 },
    measures: [],
    bufferedMeasures: [],
    allSamples: 0,
    samples: 0,
    loops: 0,
    times: 0,
    repeat: 1,
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
  const statsA = getFinalStats({
    measures,
    bufferedMeasures,
    stats,
    loops,
    times,
    samples,
    minLoopDuration,
  })
  return {
    taskId,
    runnerId,
    systemId,
    stats: statsA,
  }
}
