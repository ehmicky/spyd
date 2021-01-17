import { toInputsObj } from '../combination/inputs.js'
import { getServerUrl } from '../server/url.js'

import { spawnProcess } from './spawn.js'

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
//        process, start tasks, etc.) makes results vary based on non-obvious
//        factors. It is also hard to callibrate.
//      - Using the `duration` configuration property does not work when it is 0
//  - This would require starting both the runner and the task multiple times,
//    which wastes duration and does not allow runners with long initialization.
//  - Precision is lower due to task cold starts having a higher share of the
//    total measures.
// All combinations are spawned in parallel, for performance.
export const spawnRunnerProcesses = function ({ combinations, origin, cwd }) {
  return combinations.map((combination) =>
    spawnRunnerProcess({ combination, origin, cwd }),
  )
}

// We use `preferLocal: true` so that locally installed binaries can be used.
// We use `reject: false` to handle process exit with our own logic, which
// performs proper cleanup of all combinations.
// We use `cleanup: true` to ensure processes are cleaned up in case this
// library is called programmatically and the caller terminates the parent
// process.
export const spawnRunnerProcess = function ({
  combination,
  combination: {
    id,
    runnerSpawn: [file, ...args],
    runnerSpawnOptions,
    runnerConfig,
    taskPath,
    inputs,
  },
  origin,
  cwd,
}) {
  const spawnParams = getSpawnParams({
    id,
    runnerConfig,
    taskPath,
    inputs,
    origin,
  })
  const spawnParamsString = JSON.stringify(spawnParams)
  const childProcess = spawnProcess(
    [file, ...args, spawnParamsString],
    {
      ...runnerSpawnOptions,
      stdio: 'ignore',
      reject: false,
      cleanup: true,
      detached: true,
    },
    cwd,
  )
  return { ...combination, childProcess }
}

// Retrieve params passed to runner processes so they can find the right task
const getSpawnParams = function ({
  id,
  runnerConfig,
  taskPath,
  inputs,
  origin,
}) {
  const serverUrl = getServerUrl(origin, id)
  const inputsA = toInputsObj(inputs)
  return {
    serverUrl,
    runnerConfig,
    taskPath,
    inputs: inputsA,
    emptyLength: EMPTY_LENGTH,
  }
}

// Length of the `emptyMeasures` array that the runner should return.
// We use a hardcoded number because:
//  - This avoids differences due to some engines like v8 which optimize the
//    speed of functions after repeating them a specific amount of times
//  - This avoid different `duration` impacting the `repeat`
//  - Computing each `emptyMeasure` should be fast
//  - The resolution estimation algorithm requires a minimum amount of
//    `emptyMeasures`
const EMPTY_LENGTH = 1e4

// Terminate each runner's process at the end of the benchmark.
// In general, processes should already have exited thanks to error handling
// and cleanup logic. However, we terminate those as a safety precaution, for
// example if there is a bug.
export const terminateRunnerProcesses = function (combinations) {
  combinations.forEach(terminateRunnerProcess)
}

const terminateRunnerProcess = function ({ childProcess }) {
  childProcess.kill('SIGKILL')
}
