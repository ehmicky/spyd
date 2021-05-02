import {
  spawnRunnerProcess,
  terminateRunnerProcess,
} from '../process/runner.js'

import { handleErrorsAndMeasure } from './handle.js'

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
  const { childProcess } = await spawnRunnerProcess(combination, {
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
      childProcess,
      logsFd,
    })
  } finally {
    terminateRunnerProcess(childProcess)
  }
}
