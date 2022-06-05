import normalizeException from 'normalize-exception'

import { mergeErrorCause } from './merge/main.js'

// Ensure an error is among a specific set of error types.
// Otherwise, assign a default error type (`errorTypes[0]`).
export const allowErrorTypes = function (error, ErrorTypes) {
  const errorA = normalizeException(error)
  return ErrorTypes.some((ErrorType) => errorA instanceof ErrorType)
    ? errorA
    : mergeErrorCause(new ErrorTypes[0]('', { cause: errorA }))
}
