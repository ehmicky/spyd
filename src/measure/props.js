import { getFinalStats } from './aggregate.js'
import { getOrchestrator } from './orchestrator.js'
import { createCombinationId } from './server.js'

// Initialize some combination properties
export const addInitProps = function ({ runnerRepeats, ...combination }) {
  return {
    ...combination,
    runnerRepeats,
    id: createCombinationId(),
    orchestrator: getOrchestrator(),
    state: {
      combinationDuration: 0,
      sampleDurationLast: 0,
      sampleDurationMean: 0,
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
      resolution: Infinity,
      resolutionSize: 0,
      minLoopDuration: 0,
    },
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
  state: {
    measures,
    bufferedMeasures,
    stats,
    loops,
    times,
    samples,
    minLoopDuration,
  },
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
