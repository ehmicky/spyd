import mergeErrorCause from 'merge-error-cause'
import normalizeException from 'normalize-exception'

// Ensure an error is among a specific set of error types.
// Otherwise, assign a default SystemError type.
export const allowErrorTypes = function (error, ErrorTypes, SystemError) {
  const errorA = normalizeException(error)
  return ErrorTypes.some((ErrorType) => errorA instanceof ErrorType)
    ? errorA
    : mergeErrorCause(new SystemError('', { cause: errorA }))
}
