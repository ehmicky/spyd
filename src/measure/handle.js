import { throwOnProcessExit } from '../process/error.js'

import {
  waitForCombinationSpawn,
  startCombination,
  beforeCombination,
  afterCombination,
  endCombination,
} from './events.js'
import { performMeasureLoop } from './loop.js'
import { getMinLoopDuration } from './min_loop_duration.js'

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
  await waitForCombinationSpawn(server)
  const taskIds = await startCombination(combination, server)
  const stats = await runEvents({
    duration,
    previewConfig,
    previewState,
    stopState,
    stage,
    server,
  })
  await endCombination(server)
  return { stats, taskIds }
}

const runEvents = async function ({
  duration,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
}) {
  if (stage === 'init') {
    return
  }

  await beforeCombination(previewState, server)
  const minLoopDuration = await getMinLoopDuration(server, stage)
  const stats = await performMeasureLoop({
    duration,
    previewConfig,
    previewState,
    stopState,
    stage,
    server,
    minLoopDuration,
  })
  await afterCombination(previewState, server)
  return stats
}

const prependTaskPrefix = function (error, { taskId }, stage) {
  if (stage === 'init') {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}
