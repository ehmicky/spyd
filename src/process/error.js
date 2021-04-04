// eslint-disable-next-line fp/no-events
import { once } from 'events'

import { UserError } from '../error/main.js'

// Processes should not exit until the end of the benchmark. If they do, this
// indicates either:
//  - The task made the process exit, which is improper since it prevents proper
//    cleanup and orchestration.
//  - The runner crashed due to a bug.
export const throwOnProcessExit = async function (childProcess) {
  const { failed, message } = await childProcess
  const exitMessage = getProcessExitMessage(failed, message)
  throw new UserError(exitMessage)
}

// Replace "Command" by "Task" and remove the runner process spawnParams from
// the error message
const getProcessExitMessage = function (failed, message) {
  if (!failed) {
    return TASK_EXIT_MESSAGE
  }

  return message.replace(EXECA_MESSAGE_REGEXP, 'The task $1')
}

const TASK_EXIT_MESSAGE = 'The task must not make the process exit.'
const EXECA_MESSAGE_REGEXP = /^Command ([^:]+): .*/u

// Make any stream `error` event throw
export const throwOnStreamError = function (stream) {
  return once(stream, 'dummy_event')
}
