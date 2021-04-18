import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'

import { handleErrorsAndMeasure } from './handle.js'
import { addStopHandler, throwIfStopped } from './stop.js'

// Spawn combination processes, then measure them
export const spawnAndMeasure = async function ({
  combination,
  serverUrl,
  precisionTarget,
  cwd,
  previewConfig,
  previewState,
  stage,
  server,
  logsStream,
}) {
  const { childProcess } = await spawnRunnerProcess(combination, {
    serverUrl,
    cwd,
    server,
    logsStream,
  })

  try {
    return await stopOrMeasure({
      combination,
      precisionTarget,
      previewConfig,
      previewState,
      stage,
      server,
      childProcess,
    })
  } finally {
    terminateRunnerProcess(childProcess)
  }
}

// Handle stopping the benchmark
const stopOrMeasure = async function ({
  combination,
  precisionTarget,
  previewConfig,
  previewState,
  stage,
  server,
  childProcess,
}) {
  const { stopState, onAbort, removeStopHandler } = addStopHandler(previewState)

  try {
    const returnValue = await handleErrorsAndMeasure({
      combination,
      precisionTarget,
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
