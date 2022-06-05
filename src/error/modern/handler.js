import mergeErrorCause from 'merge-error-cause'

// Error handler that normalizes an error, merge its `error.cause` and ensure
// its type is among an allowed list of types.
// Otherwise, assign a default SystemError type.
export const onErrorHandler = function (
  { ErrorTypes, SystemError, bugsUrl },
  error,
) {
  const errorA = mergeErrorCause(error)

  if (ErrorTypes.some((ErrorType) => errorA instanceof ErrorType)) {
    return errorA
  }

  const systemErrorMessage = getSystemErrorMessage(bugsUrl)
  const systemError = new SystemError(systemErrorMessage, { cause: errorA })
  return mergeErrorCause(systemError)
}

const getSystemErrorMessage = function (bugsUrl) {
  return bugsUrl === undefined ? '' : `Please report this bug at: ${bugsUrl}`
}
