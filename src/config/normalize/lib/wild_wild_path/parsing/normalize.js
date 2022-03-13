import { inspect } from 'util'

import { getObjectTokenType, getSObjectTokenType } from '../tokens/main.js'

// Most methods accept both query and path syntaxes.
// This checks which one is used.
export const isQueryString = function (queryOrPaths) {
  return typeof queryOrPaths === 'string'
}

// Simple paths are a subset of paths which uses no unions and only array|prop
// tokens.
// Those are the ones exposed in output, as opposed to normal paths which are
// exposed in input.
export const validateSimplePath = function (simplePath) {
  if (!Array.isArray(simplePath)) {
    throwPathError(simplePath, 'It must be an array.')
  }

  simplePath.forEach((prop) => {
    validateProp(prop, simplePath)
  })
}

const validateProp = function (prop, simplePath) {
  if (getSObjectTokenType(prop) === undefined) {
    throwTokenError(
      simplePath,
      prop,
      'It must be a property name (string) or an array index (positive integer).',
    )
  }
}

// Normalize paths of tokens
export const normalizePaths = function (paths) {
  validatePaths(paths)
  const pathsA = paths.every(Array.isArray) ? paths : [paths]
  return pathsA.map(normalizePath)
}

const validatePaths = function (paths) {
  if (!Array.isArray(paths)) {
    throwPathError(paths, 'It must be an array.')
  }
}

const normalizePath = function (path) {
  return path.map((token) => normalizeToken(token, path))
}

const normalizeToken = function (token, path) {
  const tokenType = getObjectTokenType(token)
  validateToken(tokenType, token, path)
  return tokenType.normalize(token)
}

const validateToken = function (tokenType, token, path) {
  if (tokenType === undefined) {
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

const throwPathError = function (path, message) {
  throw new Error(`Invalid path: ${inspect(path)}\n${message}`)
}

const throwTokenError = function (path, token, message) {
  throwPathError(path, `Invalid token: ${inspect(token)}\n${message}`)
}
