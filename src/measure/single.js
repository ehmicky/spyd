import { startLogs, stopLogs } from '../logs/create.js'
import { addErrorTaskLogs } from '../logs/error.js'
import { startLogsStream, stopLogsStream } from '../logs/stream.js'
import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'

import { handleErrorsAndMeasure } from './handle.js'

export const logAndMeasure = async function ({
  combination,
  precisionTarget,
  cwd,
  previewState,
  stopState,
  stage,
  server,
  serverUrl,
}) {
  const { logsPath, logsFd } = await startLogs()

  try {
    return await logStreamAndMeasure({
      combination,
      precisionTarget,
      cwd,
      previewState,
      stopState,
      stage,
      server,
      serverUrl,
      logsFd,
    })
  } catch (error) {
    await addErrorTaskLogs(logsPath, error)
    throw error
  } finally {
    await stopLogs(logsPath, logsFd)
  }
}

const logStreamAndMeasure = async function ({
  combination,
  precisionTarget,
  cwd,
  previewState,
  stopState,
  stage,
  server,
  serverUrl,
  logsFd,
}) {
  const logsStream = startLogsStream(logsFd)

  try {
    return await spawnAndMeasure({
      combination,
      precisionTarget,
      cwd,
      previewState,
      stopState,
      stage,
      server,
      serverUrl,
      logsStream,
      logsFd,
    })
  } finally {
    await stopLogsStream(logsStream)
  }
}

// Spawn combination processes, then measure them
export const spawnAndMeasure = async function ({
  combination,
  precisionTarget,
  cwd,
  previewState,
  stopState,
  stage,
  server,
  serverUrl,
  logsStream,
  logsFd,
}) {
  const { childProcess, onTaskExit } = await spawnRunnerProcess(combination, {
    cwd,
    server,
    serverUrl,
    logsStream,
  })

  try {
    return await handleErrorsAndMeasure({
      combination,
      precisionTarget,
      previewState,
      stopState,
      stage,
      server,
      onTaskExit,
      logsFd,
    })
  } finally {
    terminateRunnerProcess(childProcess)
  }
}
