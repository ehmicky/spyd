import { throwOnProcessExit } from '../process/error.js'

import { runStartEnd } from './start_end.js'

// Handle errors during measuring
export const handleErrorsAndMeasure = async function ({
  combination,
  precisionTarget,
  previewConfig,
  stopState,
  stage,
  server,
  childProcess,
  logsFd,
  onAbort,
}) {
  try {
    return await Promise.race([
      throwOnProcessExit(childProcess),
      onAbort,
      runStartEnd({
        combination,
        precisionTarget,
        previewConfig,
        stopState,
        stage,
        server,
        logsFd,
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
