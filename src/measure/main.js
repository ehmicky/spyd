import { handleCombinationError } from '../error/combination.js'
import { spawnProcesses, terminateProcesses } from '../process/spawn.js'
import { startServer, endServer } from '../server/start_end.js'

import { endCombinations } from './end.js'
import { exitCombinations } from './exit.js'
import { performMeasureLoop } from './loop.js'
import { addInitProps, getFinalProps } from './props.js'
import { startCombinations } from './start.js'
import { addStopHandler } from './stop.js'

// Measure all combinations and add results to `combinations`
export const measureCombinations = async function ({
  combinations,
  config: { duration, cwd },
  stopState,
  progressState,
  onProgressError,
}) {
  const combinationsA = combinations.map(addInitProps)
  const combinationsB = await startServerAndMeasure({
    combinations: combinationsA,
    duration,
    cwd,
    stopState,
    progressState,
    onProgressError,
  })
  const combinationsC = combinationsB.map(getFinalProps)
  return combinationsC
}

const startServerAndMeasure = async function ({
  combinations,
  duration,
  cwd,
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
  stopState,
  progressState,
  onProgressError,
}) {
  const combinationsA = spawnProcesses({ combinations, origin, cwd })

  try {
    return await stopOrMeasure({
      combinations: combinationsA,
      duration,
      stopState,
      progressState,
      onProgressError,
    })
  } finally {
    terminateProcesses(combinationsA)
  }
}

const stopOrMeasure = async function ({
  combinations,
  duration,
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
  progressState,
  stopState,
}) {
  const combinationsA = await startCombinations(combinations, progressState)
  const combinationsB = await performMeasureLoop({
    combinations: combinationsA,
    duration,
    progressState,
    stopState,
  })
  const combinationsC = await endCombinations(combinationsB, progressState)
  const combinationsD = await exitCombinations(combinationsC)
  handleCombinationError(combinationsD)
  return combinationsD
}
