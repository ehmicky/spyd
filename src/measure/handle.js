import { throwOnProcessExit } from '../process/error.js'

import { endCombination } from './end.js'
import { performMeasureLoop } from './loop.js'
import { getMinLoopDuration } from './min_loop_duration.js'
import { waitForCombinationSpawn, startCombination } from './start.js'

// Handle errors during measuring
export const handleErrorsAndMeasure = async function ({
  combination,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
  childProcess,
  onAbort,
}) {
  try {
    return await Promise.race([
      throwOnProcessExit(childProcess),
      onAbort,
      measureAllCombinations({
        combination,
        duration,
        previewConfig,
        previewState,
        stopState,
        exec,
        server,
      }),
    ])
  } catch (error) {
    prependTaskPrefix(error, combination)
    throw error
  }
}

// Measure all combinations, until there is no `duration` left.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
const measureAllCombinations = async function ({
  combination,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
}) {
  const res = await waitForCombinationSpawn(server)
  const { taskIds, res: resA } = await startCombination({
    combination,
    previewState,
    server,
    res,
  })
  const { minLoopDuration, res: resB } = await getMinLoopDuration(
    combination,
    server,
    resA,
  )
  const { stats, res: resC } = await performMeasureLoop({
    combination,
    duration,
    previewConfig,
    previewState,
    stopState,
    exec,
    server,
    res: resB,
    minLoopDuration,
  })
  await endCombination(previewState, server, resC)
  return { stats, taskIds }
}

// taskId is `undefined` during init
const prependTaskPrefix = function (error, { taskId }) {
  if (taskId === undefined) {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}
