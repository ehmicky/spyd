import { normalizeError } from './normalize.js'

export const mergeErrorCause = function (error) {
  const errorA = normalizeError(error)
  return errorA
}
