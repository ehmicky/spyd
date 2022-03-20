import { getPathObjectTokenType } from '../tokens/main.js'

import { throwQueryError, throwTokenError } from './throw.js'

// Validate query string is a string
export const validateQueryString = function (queryString) {
  if (!isQueryString(queryString)) {
    throwQueryError(queryString, 'It must be a string.')
  }
}

// Most methods accept both query and array syntaxes.
// This checks which one is used.
export const isQueryString = function (query) {
  return typeof query === 'string'
}

// Empty query strings are ambiguous and not allowed
export const validateEmptyQuery = function (queryArrays, queryString) {
  if (queryArrays.length === 0) {
    throwQueryError(queryString, 'It must not be an empty string.')
  }
}

// Transform a queryArrays into a path, if possible
// Paths are a subset of query strings|arrays which use:
//  - No unions
//  - Only prop and index tokens (positive only)
// Those are the ones exposed in output, as opposed to query arrays which are
// exposed in input.
export const normalizeArraysPath = function (queryArrays, query) {
  if (queryArrays.length !== 1) {
    throwQueryError(query, 'It must not be a union.')
  }

  const [path] = queryArrays
  return normalizeArrayPath(path, query)
}

// Ensure a queryArray is a path
export const normalizeArrayPath = function (path, query) {
  if (!Array.isArray(path)) {
    throwQueryError(query, 'It must be an array.')
  }

  if (path.some(Array.isArray)) {
    throwQueryError(query, 'It must not be a union.')
  }

  path.forEach((prop) => {
    validateProp(prop, query)
  })
  return path
}

const validateProp = function (prop, query) {
  const tokenType = getPathObjectTokenType(prop)

  if (tokenType === undefined) {
    throwTokenError(
      query,
      prop,
      'It must be a property name or an array index.',
    )
  }

  if (isNegativeIndex(tokenType, prop)) {
    throwTokenError(query, prop, 'It must not be a negative index.')
  }
}

// Negative indices are not allowed in paths
const isNegativeIndex = function (tokenType, prop) {
  return tokenType.name === 'index' && (Object.is(prop, -0) || prop < 0)
}
