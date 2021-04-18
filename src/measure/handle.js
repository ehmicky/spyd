import { throwOnProcessExit } from '../process/error.js'

import {
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

const prependTaskPrefix = function (error, { taskId }, stage) {
  if (stage === 'init') {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}

// Measure all combinations, until there is no `duration` left.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
// `end` is always called, for runner-specific cleanup, providing `start`
// completed.
const measureAllCombinations = async function ({
  combination,
  duration,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
}) {
  const taskIds = await startCombination(combination, server)
  const stats = await eRunEvents({
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

const eRunEvents = async function ({
  duration,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
}) {
  try {
    return await runEvents({
      duration,
      previewConfig,
      previewState,
      stopState,
      stage,
      server,
    })
  } catch (error) {
    await silentEndCombination(server)
    throw error
  }
}

// `after` and `end` are called on exceptions.
// If an exception happens inside those themselves, it is ignored because it
// might be due to the runner being in a bad state due to the first exception.
const silentEndCombination = async function (server) {
  try {
    await endCombination(server)
  } catch {}
}

// `after` is always called, for cleanup, providing `before` completed.
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
  const stats = await ePerformLoop({
    duration,
    previewConfig,
    previewState,
    stopState,
    stage,
    server,
  })
  await afterCombination(previewState, server)
  return stats
}

const ePerformLoop = async function ({
  duration,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
}) {
  try {
    const minLoopDuration = await getMinLoopDuration(server, stage)
    return await performMeasureLoop({
      duration,
      previewConfig,
      previewState,
      stopState,
      stage,
      server,
      minLoopDuration,
    })
  } catch (error) {
    await silentAfterCombination(previewState, server)
    throw error
  }
}

const silentAfterCombination = async function (previewState, server) {
  try {
    await afterCombination(previewState, server)
  } catch {}
}
