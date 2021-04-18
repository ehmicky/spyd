import { throwOnProcessExit } from '../process/error.js'

import { runStartEnd } from './start_end.js'
import { addStopHandler, throwIfStopped } from './stop.js'

// Handle stopping the benchmark
export const stopOrMeasure = async function ({
  combination,
  duration,
  previewConfig,
  previewState,
  stage,
  server,
  childProcess,
}) {
  const { stopState, onAbort, removeStopHandler } = addStopHandler(
    previewState,
    duration,
  )

  try {
    const returnValue = await handleErrorsAndMeasure({
      combination,
      duration,
      previewConfig,
      previewState,
      stopState,
      stage,
      server,
      childProcess,
      onAbort,
    })
    throwIfStopped(stopState)
    return returnValue
  } finally {
    removeStopHandler()
  }
}

// Handle errors during measuring
const handleErrorsAndMeasure = async function ({
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
      runStartEnd({
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
