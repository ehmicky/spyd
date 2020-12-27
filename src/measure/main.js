import { spawnProcesses, terminateProcesses } from '../process/spawn.js'
import { startServer, stopServer } from '../server/start_stop.js'

import { measureAllCombinations } from './combination.js'
import { addInitProps, getFinalProps } from './props.js'

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
    await stopServer(server)
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
