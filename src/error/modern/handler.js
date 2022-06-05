import mergeErrorCause from 'merge-error-cause'

// Error handler that normalizes an error, merge its `error.cause` and ensure
// its type is among an allowed list of types.
// Otherwise, assign a default SystemError type.
export const onError = function (ErrorTypes, SystemError, error) {
  const errorA = mergeErrorCause(error)

  if (ErrorTypes.some((ErrorType) => errorA instanceof ErrorType)) {
    return errorA
  }

  const systemError = new SystemError('', { cause: errorA })
  return mergeErrorCause(systemError)
}
