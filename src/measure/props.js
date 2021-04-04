import { getFinalStats } from '../stats/compute.js'

// Initialize some combination properties
export const addInitProps = function (combination) {
  return {
    ...combination,
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
    sampleLoops: 0,
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
  stats,
  loops,
  times,
  samples,
  minLoopDuration,
}) {
  const statsA = getFinalStats({
    stats,
    loops,
    times,
    samples,
    minLoopDuration,
  })
  return { taskId, runnerId, systemId, stats: statsA }
}
