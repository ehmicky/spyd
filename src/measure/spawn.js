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
  stage,
  server,
  logsStream,
  logsFd,
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
      stage,
      server,
      childProcess,
      logsFd,
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
  stage,
  server,
  childProcess,
  logsFd,
}) {
  const { stopState, onAbort, removeStopHandler } = addStopHandler(
    previewConfig,
  )

  try {
    const returnValue = await handleErrorsAndMeasure({
      combination,
      precisionTarget,
      previewConfig,
      stopState,
      stage,
      server,
      childProcess,
      logsFd,
      onAbort,
    })
    throwIfStopped(stopState)
    return returnValue
  } finally {
    removeStopHandler()
  }
}
