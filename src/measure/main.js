import {
  spawnRunnerProcess,
  terminateRunnerProcess,
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

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < combinationsA.length; index += 1) {
    const combination = combinationsA[index]
    // eslint-disable-next-line no-await-in-loop
    const { combination: combinationA, stopped } = await measureCombination({
      combinations: combinationsA,
      combination,
      index,
      duration,
      cwd,
      previewConfig,
      previewState,
      exec,
    })
    // eslint-disable-next-line fp/no-mutation
    combinationsA[index] = combinationA

    // eslint-disable-next-line max-depth
    if (stopped) {
      return { combinations: combinationsA, stopped }
    }
  }

  return { combinations: combinationsA, stopped: false }
}

const measureCombination = async function ({
  combinations,
  combination,
  index,
  duration,
  cwd,
  previewConfig,
  previewState,
  exec,
}) {
  const { server, origin, combination: combinationA } = await startServer(
    combination,
    duration,
  )

  try {
    return await spawnAndMeasure({
      combinations,
      combination: combinationA,
      index,
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
  combination,
  index,
  origin,
  duration,
  cwd,
  previewConfig,
  previewState,
  exec,
}) {
  const combinationA = spawnRunnerProcess({ combination, origin, cwd, exec })

  try {
    return await stopOrMeasure({
      combinations,
      combination: combinationA,
      index,
      duration,
      previewConfig,
      previewState,
      exec,
    })
  } finally {
    terminateRunnerProcess(combinationA)
  }
}

// Handle stopping the benchmark
const stopOrMeasure = async function ({
  combinations,
  combination,
  index,
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
    const combinationA = await Promise.race([
      onAbort,
      measureAllCombinations({
        combinations,
        combination,
        index,
        duration,
        previewConfig,
        previewState,
        stopState,
        exec,
      }),
    ])
    return { combination: combinationA, stopped: stopState.stopped }
  } finally {
    removeStopHandler()
  }
}
