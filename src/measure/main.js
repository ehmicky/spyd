/* eslint-disable max-lines */
import { promisify } from 'util'

import now from 'precise-now'

import { getFinalStats } from './aggregate.js'
import { getBenchmarkEnd } from './duration.js'
import { getOrchestrator, initOrchestrators } from './orchestrator.js'
import { runProcesses } from './process.js'
import { startServer, stopServer } from './start_stop.js'
import { createCombinationId } from './url.js'

const pSetTimeout = promisify(setTimeout)

export const measureCombinations = async function ({
  combinations,
  config: { duration, cwd },
  progressState,
}) {
  const benchmarkEnd = getBenchmarkEnd(combinations, duration)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(progressState, { benchmarkEnd })

  const combinationsA = combinations.map(addDefaultState)
  await measureAllCombinations({
    combinations: combinationsA,
    duration,
    cwd,
    benchmarkEnd,
  })
  const combinationsB = combinationsA.map(getCombinationResult)

  await waitForTimeLeft(benchmarkEnd)
  return combinationsB
}

const measureAllCombinations = async function ({
  combinations,
  duration,
  cwd,
  benchmarkEnd,
}) {
  const { server, origin } = await startServer(duration)

  try {
    initOrchestrators({ server, combinations, benchmarkEnd })
    await runProcesses({ combinations, origin, duration, cwd })
  } finally {
    await stopServer(server)
  }
}

const addDefaultState = function ({ runnerRepeats, ...combination }) {
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
      processes: 0,
      measures: [],
      bufferedMeasures: [],
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

const getCombinationResult = function ({
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

// We stop measuring when the next sample is most likely to go beyond the target
// `duration`.
// We still wait for the time left. This wastes some time but prevents the
// progress timer from jumping fast-forward at the end, giving the feeling of a
// smooth countdown instead.
const waitForTimeLeft = async function (benchmarkEnd) {
  const timeLeft = (benchmarkEnd - now()) / NANOSECS_TO_MSECS

  if (timeLeft <= 0) {
    return
  }

  await pSetTimeout(timeLeft)
}

const NANOSECS_TO_MSECS = 1e6
/* eslint-enable max-lines */
