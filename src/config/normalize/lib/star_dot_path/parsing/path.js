import { ANY_TOKEN } from './special.js'
import { validatePath, isIndexToken } from './validate.js'

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

// Users can specify integers either:
//  - stringified for object properties
//     - those should also work for array indices for convenience, but this is
//       not documented
//  - left as is for array indices
// For convenience, we also support, but do not document, stringified integers
// as array indices.
// At query parsing time, without any target value, we do not know yet which
// intent it is:
//  - When a path was passed, we leave it as is
//  - When a query string was used instead, we assume it was meant as an array
//    index since those are much more common.
// At evaluation time, with a target value, we transtype correctly.
export const convertIndexInteger = function (token) {
  return typeof token === 'string' && POSITIVE_INTEGER_REGEXP.test(token)
    ? Number(token)
    : token
}

const POSITIVE_INTEGER_REGEXP = /^\d+$/u

export const convertIndexString = function (token) {
  return isIndexToken(token) ? String(token) : token
}
