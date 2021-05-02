import { startLogs, stopLogs } from '../logs/create.js'
import { addErrorTaskLogs } from '../logs/error.js'
import { startLogsStream, stopLogsStream } from '../logs/stream.js'

import { spawnAndMeasure } from './spawn.js'

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
