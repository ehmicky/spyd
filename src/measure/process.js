import { UserError } from '../error/main.js'

import { measureCombinations } from './combination.js'
import { spawnProcesses } from './spawn.js'

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
  cwd,
  progressState,
  onOrchestratorError,
}) {
  const combinationsA = spawnProcesses({ combinations, origin, cwd })

  try {
    return await Promise.race([
      measureCombinations(combinationsA, progressState),
      onOrchestratorError,
    ])
  } finally {
    combinationsA.forEach(stopProcess)
  }
}

// This is only done for exception handling
const waitForProcessError = async function (childProcess) {
  try {
    await childProcess
  } catch (error) {
    const execaMessage = getExecaMessage(error)
    throw new UserError(execaMessage)
  }
}

// Replace "Command" by "Task" and remove the runner process loadParams from the
// error message
const getExecaMessage = function (error) {
  return error.message.replace(EXECA_MESSAGE_REGEXP, 'Task $1')
}

const EXECA_MESSAGE_REGEXP = /^Command ([^:]+): .*/u

const addTaskPrefix = function (error, taskId, inputId) {
  const taskPrefix =
    inputId === ''
      ? `In task '${taskId}'`
      : `In task '${taskId}' (input '${inputId}')`
  // eslint-disable-next-line no-param-reassign
  error.message = `${taskPrefix}:\n${error.message}`
}

// Terminate each runner's process at the end of the benchmark.
// We ensure that processes are not in the middle of measuring a task, since
// some tasks might allocate resources that should be cleaned up.
const stopProcess = function ({ childProcess }) {
  childProcess.kill()
}
