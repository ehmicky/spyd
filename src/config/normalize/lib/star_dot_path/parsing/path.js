import { validatePath } from './validate.js'

// Most methods accept both query and path syntaxes.
// This checks which one is used.
// This also validates the query or path.
export const isQueryString = function (queryOrPath) {
  if (typeof queryOrPath === 'string') {
    return true
  }

  validatePath(queryOrPath)
  return false
}
