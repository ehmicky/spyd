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
  { duration, cwd, previewConfig, previewState, stage },
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
      stage,
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
  stage,
  server,
}) {
  const { childProcess } = await spawnRunnerProcess(combination, {
    serverUrl,
    cwd,
    stage,
    server,
  })

  try {
    return await stopOrMeasure({
      combination,
      duration,
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
