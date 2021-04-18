import {
  startLogs,
  startLogsStream,
  stopLogsStream,
  stopLogs,
  hasLogs,
} from '../process/logs_create.js'
import { addTaskLogs } from '../process/logs_read.js'
import { startServer, endServer } from '../server/main.js'

import { spawnAndMeasure } from './spawn.js'

// Measure a single combination.
// Also used when starting combinations to retrieve their tasks and steps.
// Start server to communicate with combinations, then measure them.
export const measureCombination = async function (
  combination,
  { precisionTarget, cwd, previewConfig, previewState, stage },
) {
  const { server, serverUrl } = await startServer()

  try {
    const nextFunction = hasLogs(stage) ? logAndMeasure : spawnAndMeasure
    return await nextFunction({
      combination,
      serverUrl,
      precisionTarget,
      cwd,
      previewConfig,
      previewState,
      stage,
      server,
    })
  } finally {
    await endServer(server)
  }
}

const logAndMeasure = async function ({
  combination,
  serverUrl,
  precisionTarget,
  cwd,
  previewConfig,
  previewState,
  stage,
  server,
}) {
  const { logsPath, logsFd } = await startLogs()

  try {
    return await logStreamAndMeasure({
      combination,
      serverUrl,
      precisionTarget,
      cwd,
      previewConfig,
      previewState,
      stage,
      server,
      logsFd,
    })
  } catch (error) {
    await addTaskLogs(logsPath, error)
    throw error
  } finally {
    await stopLogs(logsPath, logsFd)
  }
}

const logStreamAndMeasure = async function ({
  combination,
  serverUrl,
  precisionTarget,
  cwd,
  previewConfig,
  previewState,
  stage,
  server,
  logsFd,
}) {
  const logsStream = startLogsStream(logsFd)

  try {
    return await spawnAndMeasure({
      combination,
      serverUrl,
      precisionTarget,
      cwd,
      previewConfig,
      previewState,
      stage,
      server,
      logsStream,
      logsFd,
    })
  } finally {
    await stopLogsStream(logsStream)
  }
}
