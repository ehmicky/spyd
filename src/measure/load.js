import execa from 'execa'

import { getServerUrl } from './server.js'

// Spawn each combination's process.
// All combinations are loaded in parallel, for performance.
export const startProcess = function ({
  combination,
  combination: {
    id,
    commandConfig: runConfig,
    commandSpawn: [commandFile, ...commandArgs],
    commandSpawnOptions,
    taskPath,
    inputValue,
  },
  origin,
  cwd,
}) {
  const loadParams = getLoadParams({
    id,
    runConfig,
    taskPath,
    inputValue,
    origin,
  })
  const loadParamsString = JSON.stringify(loadParams)
  const childProcess = execa(commandFile, [...commandArgs, loadParamsString], {
    ...commandSpawnOptions,
    stdio: 'ignore',
    cwd,
    preferLocal: true,
  })
  return { ...combination, childProcess }
}

// Retrieve params passed to runner processes so they can load the right task
const getLoadParams = function ({
  id,
  runConfig,
  taskPath,
  inputValue,
  origin,
}) {
  const serverUrl = getServerUrl(origin, id)
  return { serverUrl, runConfig, taskPath, input: inputValue }
}
