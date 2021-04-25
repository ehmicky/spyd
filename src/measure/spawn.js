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
  previewState,
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
      previewState,
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
  previewState,
  stage,
  server,
  childProcess,
  logsFd,
}) {
  const { stopState, onAbort, removeStopHandler } = addStopHandler(previewState)

  try {
    const returnValue = await handleErrorsAndMeasure({
      combination,
      precisionTarget,
      previewState,
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
