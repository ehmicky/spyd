import mergeErrorCause from 'merge-error-cause'
import normalizeException from 'normalize-exception'

// Ensure an error is among a specific set of error types.
// Otherwise, assign a default SystemError type.
export const allowErrorTypes = function (error, ErrorTypes, SystemError) {
  const errorA = normalizeException(error)

  if (ErrorTypes.some((ErrorType) => errorA instanceof ErrorType)) {
    return errorA
  }

  const systemError = new SystemError('', { cause: errorA })
  return mergeErrorCause(systemError)
}
