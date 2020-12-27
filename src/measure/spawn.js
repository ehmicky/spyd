import execa from 'execa'

import { getServerUrl } from './server.js'

// Spawn each combination's process.
// All combinations are spawned in parallel, for performance.
export const spawnProcesses = function ({ combinations, origin, cwd }) {
  return combinations.map((combination) =>
    spawnProcess({ combination, origin, cwd }),
  )
}

// We use `preferLocal: true` so that locally installed binaries can be used.
// We use `reject: false` to handle process exit with our own logic, which
// performs proper cleanup of all combinations.
// We use `cleanup: true` to ensure processes are cleaned up in case this
// library is called programmatically and the caller terminates the parent
// process.
export const spawnProcess = function ({
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
  const spawnParams = getSpawnParams({
    id,
    runConfig,
    taskPath,
    inputValue,
    origin,
  })
  const spawnParamsString = JSON.stringify(spawnParams)
  const childProcess = execa(commandFile, [...commandArgs, spawnParamsString], {
    ...commandSpawnOptions,
    stdio: 'ignore',
    cwd,
    preferLocal: true,
    reject: false,
    cleanup: true,
  })
  return { ...combination, childProcess }
}

// Retrieve params passed to runner processes so they can find the right task
const getSpawnParams = function ({
  id,
  runConfig,
  taskPath,
  inputValue,
  origin,
}) {
  const serverUrl = getServerUrl(origin, id)
  return { serverUrl, runConfig, taskPath, input: inputValue }
}
