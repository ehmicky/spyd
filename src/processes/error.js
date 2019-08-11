// Forward any child process error
export const forwardChildError = function({
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

  const taskError = getTaskError(taskId, variationId)
  const signalError = getSignalError(signal)
  const exitCodeError = getExitCodeError(exitCode)
  const errorStack = getErrorStack(error)
  const errorOutputA = normalizeErrorOutput(errorOutput)
  throw new Error(
    `${taskError}Child process exited${signalError}${exitCodeError}${errorStack}${errorOutputA}`,
  )
}

const hasChildError = function({ exitCode, signal, error }) {
  return exitCode !== 0 || signal !== null || error !== undefined
}

const getSignalError = function(signal) {
  if (signal === null) {
    return ''
  }

  return ` with ${signal}`
}

const getExitCodeError = function(exitCode) {
  if (exitCode === 0 || exitCode === null) {
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
  if (errorOutput === undefined) {
    return ''
  }

  const errorOutputA = errorOutput.trim()

  if (errorOutputA === '') {
    return ''
  }

  return `\n\n${errorOutputA}`
}

// Add task/variation context to child process errors
export const getTaskError = function(taskId, variationId) {
  if (taskId === undefined) {
    return ''
  }

  if (variationId === undefined) {
    return `Task '${taskId}': `
  }

  return `Task '${taskId}' (variation '${variationId}'): `
}
