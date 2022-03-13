import { inspect } from 'util'

import { getObjectTokenType, getPathObjectTokenType } from '../tokens/main.js'

// Most methods accept both query and array syntaxes.
// This checks which one is used.
export const isQueryString = function (query) {
  return typeof query === 'string'
}

// Transform a queryArrays into a path, if possible
export const normalizePath = function (queryArrays) {
  if (queryArrays.length !== 1) {
    throwQueryArraysError(queryArrays, 'It must not be a union.')
  }

  const [queryArray] = queryArrays
  validatePath(queryArray)
  return queryArray
}

// Paths are a subset of query arrays which use:
//  - No unions
//  - Only prop tokens, and array tokens (positive only)
// Those are the ones exposed in output, as opposed to query arrays which are
// exposed in input.
export const validatePath = function (path) {
  if (!Array.isArray(path)) {
    throwQueryArraysError(path, 'It must be an array.')
  }

  path.forEach((prop) => {
    validateProp(prop, path)
  })
}

const validateProp = function (prop, path) {
  if (getPathObjectTokenType(prop) === undefined) {
    throwTokenError(
      path,
      prop,
      'It must be a property name (string) or an array index (positive integer).',
    )
  }
}

// Normalize query arrays
export const normalizeQueryArrays = function (queryArrays) {
  validateQueryArrays(queryArrays)
  const queryArraysA =
    queryArrays.every(Array.isArray) && queryArrays.length !== 0
      ? queryArrays
      : [queryArrays]
  return queryArraysA.map(normalizeQueryArray)
}

const validateQueryArrays = function (queryArrays) {
  if (!Array.isArray(queryArrays)) {
    throwQueryArraysError(queryArrays, 'It must be an array.')
  }
}

const normalizeQueryArray = function (queryArray) {
  return queryArray.map((token) => normalizeToken(token, queryArray))
}

const normalizeToken = function (token, queryArray) {
  const tokenType = getObjectTokenType(token)
  validateToken(tokenType, token, queryArray)
  return tokenType.normalize(token)
}

const validateToken = function (tokenType, token, queryArray) {
  if (tokenType === undefined) {
    throwTokenError(
      queryArray,
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

const throwQueryArraysError = function (queryArray, message) {
  throw new Error(`Invalid query: ${inspect(queryArray)}\n${message}`)
}

const throwTokenError = function (queryArray, token, message) {
  throwQueryArraysError(
    queryArray,
    `Invalid token: ${inspect(token)}\n${message}`,
  )
}

// Empty query strings are ambiguous and not allowed
export const validateEmptyQuery = function ({ arrays }) {
  if (arrays.length === 0) {
    throw new Error('it must not be an empty string.')
  }
}
