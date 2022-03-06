import { getObjectTokenType } from '../tokens/main.js'

// Normalize paths of tokens.
// Alternative of paths are optional: we normalize to use the simpler optional
// syntax.
export const normalizePaths = function (paths) {
  const pathsA = paths.every(Array.isArray) ? paths : [paths]
  return pathsA.map(normalizePath)
}

const normalizePath = function (path) {
  return path.map(normalizeToken)
}

const normalizeToken = function (token) {
  const tokenType = getObjectTokenType(token)
  return tokenType.normalize(token)
}
