import { UserError } from '../error/main.js'

import { getTimeoutError } from './timeout.js'

// Forward any child process error
export const forwardChildError = function ({
  message,
  failed,
  timedOut,
  duration,
  taskPath,
  result,
  taskId,
  inputId,
}) {
  if (!failed) {
    return
  }

  const messageA = getMessage({
    message,
    timedOut,
    duration,
    taskPath,
    result,
    taskId,
    inputId,
  })
  throw new UserError(messageA)
}

const getMessage = function ({
  message,
  timedOut,
  duration,
  taskPath,
  result: { error: errorResult },
  taskId,
  inputId,
}) {
  const taskPrefix = getTaskPrefix({ taskPath, taskId, inputId })

  if (timedOut) {
    const timeoutError = getTimeoutError(duration)
    return `${taskPrefix}${timeoutError}`
  }

  const execaError = getExecaError(message)
  return [taskPrefix, errorResult, execaError].filter(Boolean).join('\n\n')
}

// Add task/input context to child process errors
const getTaskPrefix = function ({ taskPath, taskId, inputId }) {
  if (taskId === undefined) {
    return `In '${taskPath}' `
  }

  if (inputId === '') {
    return `In '${taskPath}', task '${taskId}'`
  }

  return `In '${taskPath}', task '${taskId}' (input '${inputId}')`
}

const getExecaError = function (shortMessage) {
  return shortMessage
    .replace(EXECA_MESSAGE_START, MESSAGE_PREFIX)
    .replace(EXECA_MESSAGE_END, '')
}

const EXECA_MESSAGE_START = 'Command '
const MESSAGE_PREFIX = 'Benchmark '
const EXECA_MESSAGE_END = /: .*/u
