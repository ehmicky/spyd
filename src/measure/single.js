import { startLogs, stopLogs, hasLogs } from '../logs/create.js'
import { addErrorTaskLogs } from '../logs/error.js'
import { startLogsStream, stopLogsStream } from '../logs/stream.js'
import { startServer, endServer } from '../server/main.js'

import { spawnAndMeasure } from './spawn.js'

// Measure a single combination.
// Start server to communicate with combinations, then measure them.
export const measureCombination = async function (
  combination,
  { precisionTarget, cwd, previewState, stopState, onAbort, stage },
) {
  const { server, serverUrl } = await startServer()

  try {
    const nextFunction = hasLogs(stage) ? logAndMeasure : spawnAndMeasure
    return await nextFunction({
      combination,
      serverUrl,
      precisionTarget,
      cwd,
      previewState,
      stopState,
      onAbort,
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
  previewState,
  stopState,
  onAbort,
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
      previewState,
      stopState,
      onAbort,
      stage,
      server,
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
  serverUrl,
  precisionTarget,
  cwd,
  previewState,
  stopState,
  onAbort,
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
      previewState,
      stopState,
      onAbort,
      stage,
      server,
      logsStream,
      logsFd,
    })
  } finally {
    await stopLogsStream(logsStream)
  }
}
