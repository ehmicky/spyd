import { inspect } from 'util'

import { getObjectTokenType } from '../tokens/main.js'

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
      `It must be one of the following:
 - a property name string
 - an array index integer, positive or negative
 - a property name regular expression
 - { type: "any" }
 - { type: "slice", from: integer, to: integer }`,
    )
  }
}

const isValidToken = function (token) {
  return getObjectTokenType(token) !== undefined
}

const throwPathError = function (path, message) {
  throw new Error(`Invalid path: ${inspect(path)}\n${message}`)
}

const throwTokenError = function (path, token, message) {
  throwPathError(path, `Invalid token: ${inspect(token)}\n${message}`)
}
