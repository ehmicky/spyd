import { mergeErrorCause } from './merge/main.js'
import { allowErrorTypes } from './types.js'

// Error handler that normalizes an error, merge its `error.cause` and ensure
// its type is among an allowed list of types.
export const onError = function (error, ErrorTypes) {
  const errorA = mergeErrorCause(error)
  const errorB = allowErrorTypes(errorA, ErrorTypes)
  return errorB
}
