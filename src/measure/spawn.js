import { handleCombinationError } from '../error/combination.js'
import {
  spawnRunnerProcesses,
  terminateRunnerProcesses,
} from '../process/runner.js'

import { endCombinations } from './end.js'
import { exitCombinations } from './exit.js'
import { performMeasureLoop } from './loop.js'
import { startCombinations } from './start.js'
import { addStopHandler } from './stop.js'

// Spawn combination processes, then measure them
export const spawnAndMeasure = async function ({
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

// Handle stopping the benchmark
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
