import { noUnhandledRejection } from '../../error/unhandled_rejection.js'
import { wrapError } from '../../error/wrap.js'
import { spawnProcess } from '../../utils/spawn.js'

import { throwOnSpawnExit, throwOnTaskExit } from './error.js'
import { receiveReturnValue } from './ipc.js'

// Each combination is spawned in its own process:
//  - This ensures combinations are not changing each other through mutating
//    global memory
//  - This ensures runtime optimization is bound to each combination
//  - This allows runners with different programming languages
// We use a single long process per combination instead of spawning multiple
// ones:
//  - This would require setting a duration or amount of measures per process.
//    To estimate those for different types of tasks is hard and brittle:
//      - Using hard-coded durations does not work since machines or tasks have
//        very different speeds
//      - Using the speed of the machine (by measuring the duration to spawn
//        process, start tasks, etc.) makes results vary based on non-obvious
//        factors. It is also hard to calibrate.
//  - This would require starting both the runner and the task multiple times,
//    which wastes duration and does not allow runners with long initialization.
//  - Precision is lower due to task cold starts having a higher share of the
//    total measures.
// We use:
//  - `reject: false` to handle process exit with our own logic, which
//    performs proper cleanup of all combinations.
//  - `detached: true` so that signals (like `SIGINT`) are not propagated to
//    the runner process
//  - `cleanup: true` to ensure processes are cleaned up in case this
//    library is called programmatically and the caller terminates the parent
//    process.
export const spawnRunnerProcess = async function ({
  combination: {
    dimensions: {
      runner: {
        id,
        spawn: [file, ...args],
        spawnOptions,
      },
    },
  },
  config: { cwd },
  server,
  serverUrl,
  logsStream,
}) {
  try {
    const childProcess = spawnProcess(
      [file, ...args, serverUrl],
      {
        ...spawnOptions,
        stdio: getStdio(logsStream),
        reject: false,
        detached: true,
        cleanup: true,
      },
      cwd,
    )
    await waitForIpcSetup(childProcess, server)
    const onTaskExit = noUnhandledRejection(throwOnTaskExit(childProcess))
    return { childProcess, onTaskExit }
  } catch (error) {
    throw wrapError(error, `In runner "${id}":`)
  }
}

// The `dev` command directly streams stdout/stderr.
// This means that it might behave differently from the `run` command since it
// has a TTY. This might make debugging some TTY-related problems harder.
// However, the `dev` command is meant to be run in an interactive terminal.
// Therefore, not using a TTY would impact the developer experience: not
// printing colors, progress bars, etc.
const getStdio = function (logsStream) {
  return logsStream === undefined
    ? ['ignore', 'inherit', 'inherit']
    : ['ignore', logsStream, logsStream]
}

// Wait for IPC to be initialized. Throw if process exits before that.
const waitForIpcSetup = async function (childProcess, server) {
  await Promise.race([
    throwOnSpawnExit(childProcess),
    receiveReturnValue(server),
  ])
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
