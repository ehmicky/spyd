import { inspect } from 'util'

import { ANY_TOKEN } from './special.js'

// Validate a path argument against syntax errors
export const validatePath = function (path) {
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
      'It must be a string, integer or Symbol.for("*").',
    )
  }
}

const isValidToken = function (token) {
  return typeof token === 'string' || isIndexToken(token) || token === ANY_TOKEN
}

// Check if token is an array index integer
export const isIndexToken = function (token) {
  return Number.isInteger(token)
}

const throwPathError = function (path, message) {
  throw new Error(`Invalid query path: ${inspect(path)}\n${message}`)
}

const throwTokenError = function (path, token, message) {
  throwPathError(path, `Invalid token: ${inspect(token)}\n${message}`)
}
