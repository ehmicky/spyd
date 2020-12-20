import { v4 as uuidv4 } from 'uuid'

import { getFinalStats } from './aggregate.js'

// Initialize some combination properties
export const addInitProps = function ({ runnerRepeats, ...combination }) {
  return {
    ...combination,
    runnerRepeats,
    id: uuidv4(),
    combinationDuration: 0,
    sampleDurationLast: 0,
    sampleDurationMean: 0,
    aggregateCountdown: 0,
    loaded: false,
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
    resolution: Infinity,
    resolutionSize: 0,
    minLoopDuration: 0,
  }
}

// Retrieve final combination properties used for reporting
export const getFinalProps = function ({
  row,
  column,
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
    row,
    column,
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
