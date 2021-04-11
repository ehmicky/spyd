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
  stage,
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
        stage,
        server,
      }),
    ])
  } catch (error) {
    prependTaskPrefix(error, combination, stage)
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
  stage,
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
    server,
    resA,
    stage,
  )
  const { stats, res: resC } = await performMeasureLoop({
    duration,
    previewConfig,
    previewState,
    stopState,
    stage,
    server,
    res: resB,
    minLoopDuration,
  })
  await endCombination(previewState, server, resC)
  return { stats, taskIds }
}

const prependTaskPrefix = function (error, { taskId }, stage) {
  if (stage === 'init') {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}
