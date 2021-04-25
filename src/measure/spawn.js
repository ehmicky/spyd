import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'

import { handleErrorsAndMeasure } from './handle.js'

// Spawn combination processes, then measure them
export const spawnAndMeasure = async function ({
  combination,
  serverUrl,
  precisionTarget,
  cwd,
  previewState,
  stopState,
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
    return await handleErrorsAndMeasure({
      combination,
      precisionTarget,
      previewState,
      stopState,
      stage,
      server,
      childProcess,
      logsFd,
    })
  } finally {
    terminateRunnerProcess(childProcess)
  }
}
