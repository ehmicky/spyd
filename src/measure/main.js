import { handleCombinationError } from '../error/combination.js'
import {
  spawnRunnerProcesses,
  terminateRunnerProcesses,
} from '../process/runner.js'
import { startProgress, endProgress } from '../progress/start_end.js'
import { startServer, endServer } from '../server/start_end.js'

import { endCombinations } from './end.js'
import { exitCombinations } from './exit.js'
import { performMeasureLoop } from './loop.js'
import { addInitProps } from './props.js'
import { startCombinations } from './start.js'
import { addStopHandler, getStopState } from './stop.js'

// Measure all combinations and add results to `combinations`.
// Also used when starting combinations to retrieve their tasks and steps.
export const measureBenchmark = async function (
  combinations,
  { duration, progresses, cwd, exec = false },
) {
  const stopState = getStopState()
  const { progressState, progressId, onProgressError } = startProgress({
    combinations,
    duration,
    progresses,
  })

  try {
    const combinationsA = combinations.map(addInitProps)
    const combinationsB = await startServerAndMeasure({
      combinations: combinationsA,
      duration,
      cwd,
      exec,
      stopState,
      progressState,
      onProgressError,
    })
    return { combinations: combinationsB, stopped: stopState.stopped }
  } finally {
    await endProgress(progressId)
  }
}

const startServerAndMeasure = async function ({
  combinations,
  duration,
  cwd,
  exec,
  stopState,
  progressState,
  onProgressError,
}) {
  const { server, origin, combinations: combinationsA } = await startServer(
    combinations,
    duration,
  )

  try {
    return await spawnAndMeasure({
      combinations: combinationsA,
      origin,
      duration,
      cwd,
      exec,
      stopState,
      progressState,
      onProgressError,
    })
  } finally {
    await endServer(server)
  }
}

const spawnAndMeasure = async function ({
  combinations,
  origin,
  duration,
  cwd,
  exec,
  stopState,
  progressState,
  onProgressError,
}) {
  const combinationsA = spawnRunnerProcesses({
    combinations,
    origin,
    cwd,
    exec,
  })

  try {
    return await stopOrMeasure({
      combinations: combinationsA,
      duration,
      exec,
      stopState,
      progressState,
      onProgressError,
    })
  } finally {
    terminateRunnerProcesses(combinationsA)
  }
}

const stopOrMeasure = async function ({
  combinations,
  duration,
  exec,
  stopState,
  progressState,
  onProgressError,
}) {
  const { onAbort, removeStopHandler } = addStopHandler({
    stopState,
    progressState,
    duration,
  })

  try {
    return await Promise.race([
      onAbort,
      ...onProgressError,
      measureAllCombinations({
        combinations,
        duration,
        exec,
        progressState,
        stopState,
      }),
    ])
  } finally {
    removeStopHandler()
  }
}

// Measure all combinations, until there is no `duration` left.
const measureAllCombinations = async function ({
  combinations,
  duration,
  exec,
  progressState,
  stopState,
}) {
  const combinationsA = await startCombinations(combinations, progressState)
  const combinationsB = await performMeasureLoop({
    combinations: combinationsA,
    duration,
    exec,
    progressState,
    stopState,
  })
  const combinationsC = await endCombinations(combinationsB, progressState)
  const combinationsD = await exitCombinations(combinationsC)
  handleCombinationError(combinationsD)
  return combinationsD
}
