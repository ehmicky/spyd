import { toInputsObj } from '../combination/inputs.js'

import { spawnProcess } from './spawn.js'

// Each combination is spawned in its own process:
//  - This ensures combinations are not changing each other through mutating
//    global memory
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
//        factors. It is also hard to calibrate.
//      - Using the `duration` configuration property does not work when it is 0
//  - This would require starting both the runner and the task multiple times,
//    which wastes duration and does not allow runners with long initialization.
//  - Precision is lower due to task cold starts having a higher share of the
//    total measures.
// We use `preferLocal: true` so that locally installed binaries can be used.
// We use `reject: false` to handle process exit with our own logic, which
// performs proper cleanup of all combinations.
// We use `cleanup: true` to ensure processes are cleaned up in case this
// library is called programmatically and the caller terminates the parent
// process.
export const spawnRunnerProcess = function ({
  combination: {
    runnerSpawn: [file, ...args],
    runnerSpawnOptions,
    runnerConfig,
    taskId,
    taskPath,
    inputs,
  },
  serverUrl,
  cwd,
  exec,
}) {
  const spawnParams = getSpawnParams({
    runnerConfig,
    taskId,
    taskPath,
    inputs,
    serverUrl,
  })
  const spawnParamsString = JSON.stringify(spawnParams)
  const stdio = getStdio(exec)
  const childProcess = spawnProcess(
    [file, ...args, spawnParamsString],
    {
      ...runnerSpawnOptions,
      stdio,
      reject: false,
      cleanup: true,
      detached: true,
    },
    cwd,
  )
  return childProcess
}

// Retrieve params passed to runner processes so they can find the right task
const getSpawnParams = function ({
  runnerConfig,
  taskId,
  taskPath,
  inputs,
  serverUrl,
}) {
  const inputsA = toInputsObj(inputs)
  const calibrate = taskId === undefined ? 0 : CALIBRATE_LENGTH
  return {
    serverUrl,
    runnerConfig,
    taskId,
    taskPath,
    inputs: inputsA,
    calibrate,
  }
}

// Length of the `calibration` array that the runner should return.
// We use a hardcoded number because:
//  - This avoids differences due to some engines like v8 which optimize the
//    speed of functions after repeating them a specific amount of times
//  - This avoid different `duration` impacting the `repeat`
//  - Computing each `calibration` should be fast
//  - The resolution estimation algorithm requires a minimum amount of
//    `calibrations`
// Higher numbers are more likely to be slow when the resolution is low.
// Lower numbres are less precise.
const CALIBRATE_LENGTH = 1e2

// The `exec` command prints stdout/stderr. stdin is always ignored.
// Anything printed during process spawning (e.g. top-level scope in Node.js)
// might be repeated for each combination. This is good since:
//  - It makes it clear that each combination has its own process
//  - Some stdout/stderr might different from process to process
const getStdio = function (exec) {
  return exec
    ? ['ignore', 'inherit', 'inherit']
    : ['ignore', 'ignore', 'ignore']
}

// Terminate each combination's process after being measured.
// The combination can be in three possible states:
//  - Success:
//     - The process should be hanging for a final HTTP response
//     - We terminate the process with a signal instead of sending the final
//       response because:
//        - It allows to assume that process should never exit, which simplifies
//          handling abnormal process termination.
//        - It is consistent with the failed combinations termination behavior.
//  - User error (exception in a task)
//     - The process should be hanging for a final HTTP response
//     - Runners should run `afterAll`, when defined
//        - If an exception is thrown in afterAll, it should be reported instead
//          since bugs in error handling logic is more critical.
//  - Core bug
export const terminateRunnerProcess = function (childProcess) {
  childProcess.kill('SIGKILL')
}
