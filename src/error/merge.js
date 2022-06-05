import { normalizeError } from './normalize/main.js'

export const mergeErrorCause = function (error) {
  const errorA = normalizeError(error)
  return errorA
}
