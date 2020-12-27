import { handleCombinationError } from '../error/combination.js'
import { spawnProcesses, terminateProcesses } from '../process/spawn.js'
import { startServer, endServer } from '../server/start_end.js'

import { endCombinations } from './end.js'
import { exitCombinations } from './exit.js'
import { performMeasureLoop } from './loop.js'
import { addInitProps, getFinalProps } from './props.js'
import { startCombinations } from './start.js'

// Measure all combinations and add results to `combinations`
export const measureCombinations = async function ({
  combinations,
  config: { duration, cwd },
  progressState,
}) {
  const combinationsA = combinations.map((combination) =>
    addInitProps(combination, duration),
  )
  const combinationsB = await startServerAndMeasure({
    combinations: combinationsA,
    duration,
    cwd,
    progressState,
  })
  const combinationsC = combinationsB.map(getFinalProps)
  return combinationsC
}

const startServerAndMeasure = async function ({
  combinations,
  duration,
  cwd,
  progressState,
}) {
  const { server, origin, combinations: combinationsA } = await startServer(
    combinations,
    duration,
  )

  try {
    return await spawnAndMeasure({
      combinations: combinationsA,
      origin,
      cwd,
      progressState,
    })
  } finally {
    await endServer(server)
  }
}

const spawnAndMeasure = async function ({
  combinations,
  origin,
  cwd,
  progressState,
}) {
  const combinationsA = spawnProcesses({ combinations, origin, cwd })

  try {
    return await measureAllCombinations(combinationsA, progressState)
  } finally {
    terminateProcesses(combinationsA)
  }
}

// Measure all combinations, until there is no `duration` left.
const measureAllCombinations = async function (combinations, progressState) {
  const combinationsA = await startCombinations(combinations, progressState)
  const combinationsB = await performMeasureLoop(combinationsA, progressState)
  const combinationsC = await endCombinations(combinationsB, progressState)
  const combinationsD = await exitCombinations(combinationsC)
  handleCombinationError(combinationsD)
  return combinationsD
}
