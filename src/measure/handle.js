import { throwOnProcessExit } from '../process/error.js'

import { endCombination } from './end.js'
import { performMeasureLoop } from './loop.js'
import { startCombination } from './start.js'

// Handle errors during measuring
export const handleErrorsAndMeasure = async function ({
  taskId,
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
        taskId,
        duration,
        previewConfig,
        previewState,
        stopState,
        exec,
        server,
      }),
    ])
  } catch (error) {
    prependTaskPrefix(error, taskId)
    throw error
  }
}

// Measure all combinations, until there is no `duration` left.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
const measureAllCombinations = async function ({
  taskId,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
}) {
  const { res, taskIds, minLoopDuration } = await startCombination(
    previewState,
    server,
  )
  const { stats, res: resA } = await performMeasureLoop({
    taskId,
    duration,
    previewConfig,
    previewState,
    stopState,
    exec,
    server,
    res,
    minLoopDuration,
  })
  await endCombination(previewState, server, resA)
  return { stats, taskIds }
}

// taskId is `undefined` during init
const prependTaskPrefix = function (error, taskId) {
  if (taskId === undefined) {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}
