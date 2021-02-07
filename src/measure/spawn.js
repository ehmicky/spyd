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
  previewConfig,
  exec,
  stopState,
  previewState,
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
      previewConfig,
      exec,
      stopState,
      previewState,
    })
  } finally {
    terminateRunnerProcesses(combinationsA)
  }
}

// Handle stopping the benchmark
const stopOrMeasure = async function ({
  combinations,
  duration,
  previewConfig,
  exec,
  previewState,
}) {
  const { stopState, onAbort, removeStopHandler } = addStopHandler(
    previewState,
    duration,
  )

  try {
    const combinationsA = await Promise.race([
      onAbort,
      measureAllCombinations({
        combinations,
        duration,
        previewConfig,
        exec,
        previewState,
        stopState,
      }),
    ])
    return { combinations: combinationsA, stopped: stopState.stopped }
  } finally {
    removeStopHandler()
  }
}

// Measure all combinations, until there is no `duration` left.
const measureAllCombinations = async function ({
  combinations,
  duration,
  previewConfig,
  exec,
  previewState,
  stopState,
}) {
  const combinationsA = await startCombinations(combinations, previewState)
  const combinationsB = await performMeasureLoop({
    combinations: combinationsA,
    duration,
    previewConfig,
    exec,
    previewState,
    stopState,
  })
  const combinationsC = await endCombinations(combinationsB, previewState)
  const combinationsD = await exitCombinations(combinationsC)
  handleCombinationError(combinationsD)
  return combinationsD
}
