// eslint-disable-next-line fp/no-events
import { once } from 'events'

import { UserError } from './main.js'

// When the logic involving a combination throws, we do not propagate the
// exception right away. This allows the combination and other combinations
// to properly end and exit.
// The latest error has priority over the earliest since errors in cleanup code
// is harder to debug.
export const addCombinationError = function (combination, error) {
  if (error === undefined) {
    return combination
  }

  return { ...combination, error }
}

export const handleCombinationError = function (combinations) {
  const erroredCombination = combinations.find(combinationHasErrored)

  if (erroredCombination === undefined) {
    return
  }

  throw getCombinationError(erroredCombination)
}

export const combinationHasErrored = function ({ error }) {
  return error !== undefined
}

const getCombinationError = function ({ error, taskId, inputId }) {
  const taskPrefix = getTaskPrefix(taskId, inputId)
  error.message = `${taskPrefix}:\n${error.message}`
  return error
}

const getTaskPrefix = function (taskId, inputId) {
  return inputId === ''
    ? `In task '${taskId}'`
    : `In task '${taskId}' (input '${inputId}')`
}

// Processes should not exit until the end of the benchmark. If they do, this
// indicates either:
//  - The task made the process exit, which is improper since it prevents proper
//    cleanup and orchestration.
//  - The runner crashed due to a bug.
export const failOnProcessExit = async function (combination, stopState) {
  const { failed, message } = await combination.childProcess
  const exitMessage = getProcessExitMessage({ failed, message, stopState })
  const error = new UserError(exitMessage)
  return { ...combination, error }
}

// Replace "Command" by "Task" and remove the runner process spawnParams from
// the error message
const getProcessExitMessage = function ({
  failed,
  message,
  stopState: { longTask } = {},
}) {
  if (longTask) {
    return LONG_TASK_MESSAGE
  }

  if (!failed) {
    return TASK_EXIT_MESSAGE
  }

  return message.replace(EXECA_MESSAGE_REGEXP, 'The task $1')
}

const LONG_TASK_MESSAGE =
  'The task is either never ending, or slower than the "duration" configuration property.'
const TASK_EXIT_MESSAGE = 'The task must not make the process exit.'
const EXECA_MESSAGE_REGEXP = /^Command ([^:]+): .*/u

// Make any stream `error` event throw
export const throwOnStreamError = function (stream) {
  return once(stream, 'dummy_event')
}
