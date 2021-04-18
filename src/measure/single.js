import { startLogs, stopLogs } from '../process/logs.js'
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
    return await spawnAndLog({
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
  const { logsPath, logsFd, logsStream } = await startLogs(stage)

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
    await stopLogs(logsPath, logsFd)
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
