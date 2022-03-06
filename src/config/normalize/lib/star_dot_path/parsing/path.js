import { ANY_TOKEN } from './special.js'
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

// Check if * is used
export const pathHasAny = function (path) {
  return path.some(isAnyToken)
}

const isAnyToken = function (token) {
  return token === ANY_TOKEN
}
