import { v4 as uuidv4 } from 'uuid'

import { getFinalStats } from '../sample/aggregate.js'

// Initialize some combination properties
export const addInitProps = function ({ runnerRepeats, ...combination }) {
  return {
    ...combination,
    runnerRepeats,
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
    // If the runner does not support `repeats`, `repeatInit` is always
    // `false`
    repeatInit: runnerRepeats,
    measureCosts: [],
    resolution: Number.POSITIVE_INFINITY,
    resolutionSize: 0,
    minLoopDuration: 0,
  }
}

// Retrieve final combination properties used for reporting
export const getFinalProps = function ({
  taskId,
  taskTitle,
  inputId,
  inputTitle,
  commandRunner,
  commandId,
  commandTitle,
  commandDescription,
  systemId,
  systemTitle,
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
    taskTitle,
    inputId,
    inputTitle,
    commandRunner,
    commandId,
    commandTitle,
    commandDescription,
    systemId,
    systemTitle,
    stats: statsA,
  }
}
