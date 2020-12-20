/* eslint-disable max-lines */
import { promisify } from 'util'

import now from 'precise-now'

import { getBenchmarkEnd } from './duration.js'
import { initOrchestrators } from './orchestrator.js'
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
  const combinationsB = measureAllCombinations({
    combinations: combinationsA,
    duration,
    cwd,
    benchmarkEnd,
  })
  const combinationsC = combinationsB.map(getCombinationResult)

  await waitForTimeLeft(benchmarkEnd)
  return combinationsC
}

const measureAllCombinations = async function ({
  combinations,
  duration,
  cwd,
  benchmarkEnd,
}) {
  const { server, origin } = await startServer(duration)

  try {
    const combinationsA = initOrchestrators({
      server,
      combinations,
      benchmarkEnd,
    })
    await runProcesses({ combinations: combinationsA, origin, duration, cwd })
    return combinationsA
  } finally {
    await stopServer(server)
  }
}

const addDefaultState = function ({ runnerRepeats, ...combination }) {
  return {
    ...combination,
    runnerRepeats,
    id: createCombinationId(),
    state: {
      combinationDuration: 0,
      processes: 0,
      measures: [],
      processMeasures: [],
      taskMedians: [],
      // `taskMedian` is initially 0. This means it is not used to compute
      // `maxDuration` in the first process.
      taskMedian: 0,
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
  stats,
}) {
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
    stats,
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
