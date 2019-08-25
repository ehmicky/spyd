import { isTimeout } from './timeout.js'

// Forward any child process error
export const forwardChildError = function({
  child,
  taskPath,
  exitCode,
  signal,
  error,
  errorOutput,
  taskId,
  variationId,
}) {
  if (!hasChildError({ exitCode, signal, error })) {
    return
  }

  // The child process might already have exited. In that case, this is a noop.
  child.kill()

  const taskError = getTaskError({ taskPath, taskId, variationId })

  if (isTimeout(error)) {
    throw new TypeError(`${taskError}${error.message}`)
  }

  const message = getErrorMessage({
    taskError,
    signal,
    exitCode,
    error,
    errorOutput,
  })
  throw new Error(message)
}

const hasChildError = function({ exitCode, signal, error }) {
  return exitCode !== 0 || signal !== null || error !== undefined
}

// Add task/variation context to child process errors
const getTaskError = function({ taskPath, taskId, variationId }) {
  if (taskId === undefined) {
    return `In '${taskPath}': `
  }

  if (variationId === '') {
    return `In '${taskPath}', task '${taskId}': `
  }

  return `In '${taskPath}', task '${taskId}' (variation '${variationId}'): `
}

const getErrorMessage = function({
  taskError,
  signal,
  exitCode,
  error,
  errorOutput,
}) {
  const signalError = getSignalError(signal)
  const exitCodeError = getExitCodeError(exitCode)
  const errorStack = getErrorStack(error)
  const errorOutputA = normalizeErrorOutput(errorOutput)
  return `${taskError}child process exited${signalError}${exitCodeError}${errorStack}${errorOutputA}`
}

const getSignalError = function(signal) {
  if (signal === null || signal === undefined) {
    return ''
  }

  return ` with ${signal}`
}

const getExitCodeError = function(exitCode) {
  if (exitCode === 0 || exitCode === null || exitCode === undefined) {
    return ''
  }

  return ` (exit code ${exitCode})`
}

const getErrorStack = function(error) {
  if (error === undefined) {
    return ''
  }

  return `\n\n${error.stack}`
}

const normalizeErrorOutput = function(errorOutput) {
  if (errorOutput === undefined || errorOutput === '') {
    return ''
  }

  return `\n\n${errorOutput}`
}
