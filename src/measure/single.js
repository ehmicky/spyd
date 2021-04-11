import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'
import { startServer, endServer } from '../server/main.js'

import { handleErrorsAndMeasure } from './handle.js'
import { addStopHandler, throwIfStopped } from './stop.js'

// Measure a single combination.
// Also used when starting combinations to retrieve their tasks and steps.
// Start server to communicate with combinations, then measure them.
export const measureCombination = async function (
  combination,
  { duration, cwd, previewConfig, previewState, exec },
) {
  const { server, serverUrl } = await startServer()

  try {
    return await spawnAndMeasure({
      combination,
      serverUrl,
      duration,
      cwd,
      previewConfig,
      previewState,
      exec,
      server,
    })
  } finally {
    await endServer(server)
  }
}

// Spawn combination processes, then measure them
const spawnAndMeasure = async function ({
  combination,
  serverUrl,
  duration,
  cwd,
  previewConfig,
  previewState,
  exec,
  server,
}) {
  const childProcess = spawnRunnerProcess(combination, { serverUrl, cwd, exec })

  try {
    return await stopOrMeasure({
      combination,
      duration,
      previewConfig,
      previewState,
      exec,
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
  duration,
  previewConfig,
  previewState,
  exec,
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
      exec,
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
