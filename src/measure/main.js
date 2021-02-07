import {
  spawnRunnerProcesses,
  terminateRunnerProcesses,
} from '../process/runner.js'
import { startServer, endServer } from '../server/start_end.js'

import { measureAllCombinations } from './all.js'
import { addInitProps } from './props.js'
import { addStopHandler } from './stop.js'

// Measure all combinations and add results to `combinations`.
// Also used when starting combinations to retrieve their tasks and steps.
// Start server to communicate with combinations, then measure them.
export const measureBenchmark = async function (
  combinations,
  { duration, cwd, previewConfig, previewState, exec },
) {
  const combinationsA = combinations.map(addInitProps)

  const { server, origin, combinations: combinationsB } = await startServer(
    combinationsA,
    duration,
  )

  try {
    return await spawnAndMeasure({
      combinations: combinationsB,
      origin,
      duration,
      cwd,
      previewConfig,
      previewState,
      exec,
    })
  } finally {
    await endServer(server)
  }
}

// Spawn combination processes, then measure them
const spawnAndMeasure = async function ({
  combinations,
  origin,
  duration,
  cwd,
  previewConfig,
  previewState,
  exec,
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
      previewState,
      exec,
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
  previewState,
  exec,
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
        previewState,
        stopState,
        exec,
      }),
    ])
    return { combinations: combinationsA, stopped: stopState.stopped }
  } finally {
    removeStopHandler()
  }
}
