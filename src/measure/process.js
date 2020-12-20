import execa from 'execa'

import { UserError } from '../error/main.js'

import { measureCombination } from './combination.js'
import { getServerUrl } from './url.js'

// Each combination is spawned in its own process:
//  - This ensures runtime optimization is bound to each combination
//  - This allows runners with different programming languages
// We use a single long process per combination instead of spawning multiple
// ones:
//  - This would require setting a maximum duration or amount of measures. To
//    estimate those for different types of tasks is hard and brittle:
//      - Using hard-coded durations does not work since machines or tasks have
//        very different speeds
//      - Using the speed of the machine (by measuring the duration to spawn
//        process, load tasks, etc.) makes results vary based on non-obvious
//        factors. It is also hard to callibrate.
//      - Using the `duration` configuration property does not work when it is
//        `0`
//  - This would require loading both the runner and the task multiple times,
//    which wastes duration and does not allow runners with long initialization.
//  - Variance is higher due to task cold starts having a higher share of the
//    total measures.
export const runProcesses = async function ({
  combinations,
  origin,
  duration,
  cwd,
}) {
  const combinationProcesses = combinations.map((combination) =>
    startProcess({ combination, origin, cwd }),
  )

  try {
    await Promise.all(
      combinationProcesses.map(({ childProcess, combination }) =>
        runProcess({ childProcess, combination, duration }),
      ),
    )
  } finally {
    combinationProcesses.forEach(stopProcess)
  }
}

// Spawn each combination's process.
// All combinations are loaded in parallel, for performance.
const startProcess = function ({
  combination,
  combination: {
    id,
    commandConfig: runConfig,
    commandSpawn: [commandFile, ...commandArgs],
    commandSpawnOptions,
    taskPath,
    taskId,
    input,
  },
  origin,
  cwd,
}) {
  const loadParams = getLoadParams({
    id,
    runConfig,
    taskPath,
    taskId,
    input,
    origin,
  })
  const loadParamsString = JSON.stringify(loadParams)
  const childProcess = execa(commandFile, [...commandArgs, loadParamsString], {
    ...commandSpawnOptions,
    stdio: 'ignore',
    cwd,
    preferLocal: true,
  })
  return { childProcess, combination }
}

// Retrieve params passed to runner processes so they can load the right task
const getLoadParams = function ({
  id,
  runConfig,
  taskPath,
  taskId,
  input,
  origin,
}) {
  const serverUrl = getServerUrl(origin, id)
  return { serverUrl, runConfig, taskPath, taskId, input }
}

const runProcess = async function ({ childProcess, combination, duration }) {
  await Promise.race([
    waitForProcessError(childProcess, combination),
    measureCombination({ combination, duration }),
  ])
}

// This is only done for exception handling
const waitForProcessError = async function (childProcess, { taskId }) {
  try {
    await childProcess
  } catch (error) {
    throw new UserError(`Task '${taskId}' failed:\n${error.stack}`)
  }
}

// Terminate each runner's process at the end of the benchmark.
// We ensure that processes are not in the middle of measuring a task, since
// some tasks might allocate resources that should be cleaned up.
const stopProcess = function ({ childProcess }) {
  childProcess.kill()
}
