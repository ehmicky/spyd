import { inspect } from 'util'

import { isAnyToken } from '../tokens/any.js'
import { isIndexToken } from '../tokens/array.js'
import { isPropToken } from '../tokens/prop.js'
import { isRegExpToken } from '../tokens/regexp.js'

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

// Validate a path argument against syntax errors
const validatePath = function (path) {
  if (!Array.isArray(path)) {
    throwPathError(path, 'It must be an array.')
  }

  path.forEach((token) => {
    validateToken(token, path)
  })
}

const validateToken = function (token, path) {
  if (!isValidToken(token)) {
    throwTokenError(
      path,
      token,
      'It must be a string, an integer, a regular expression, or { type: "any" }',
    )
  }
}

const isValidToken = function (token) {
  return (
    isPropToken(token) ||
    isIndexToken(token) ||
    isAnyToken(token) ||
    isRegExpToken(token)
  )
}

const throwPathError = function (path, message) {
  throw new Error(`Invalid query path: ${inspect(path)}\n${message}`)
}

const throwTokenError = function (path, token, message) {
  throwPathError(path, `Invalid token: ${inspect(token)}\n${message}`)
}
