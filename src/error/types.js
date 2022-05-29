import { normalizeError } from './utils.js'
import { wrapError } from './wrap.js'

// Ensure an error is among a specific set of error types.
// Otherwise, assign a default error type (`errorTypes[0]`).
export const allowErrorTypes = function (error, errorTypes) {
  const errorA = normalizeError(error)
  return errorTypes.some((errorType) => errorA instanceof errorType)
    ? errorA
    : wrapError(errorA, '', errorTypes[0])
}
