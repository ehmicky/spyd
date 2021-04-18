import {
  startLogs,
  startLogsStream,
  stopLogsStream,
  stopLogs,
  addTaskTaskLogs,
  hasLogs,
} from '../process/logs_create.js'
import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'
import { startServer, endServer } from '../server/main.js'

import { stopOrMeasure } from './handle.js'

// Measure a single combination.
// Also used when starting combinations to retrieve their tasks and steps.
// Start server to communicate with combinations, then measure them.
export const measureCombination = async function (
  combination,
  { precisionTarget, cwd, previewConfig, previewState, stage },
) {
  const { server, serverUrl } = await startServer()

  try {
    return hasLogs(stage)
      ? await spawnAndLog({
          combination,
          serverUrl,
          precisionTarget,
          cwd,
          previewConfig,
          previewState,
          stage,
          server,
        })
      : await spawnAndMeasure({
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

const spawnAndLog = async function ({
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
    return await spawnAndLogStream({
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
    await addTaskTaskLogs(logsPath, error)
    throw error
  } finally {
    await stopLogs(logsPath, logsFd)
  }
}

const spawnAndLogStream = async function ({
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
    })
  } finally {
    await stopLogsStream(logsStream)
  }
}

// Spawn combination processes, then measure them
const spawnAndMeasure = async function ({
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
