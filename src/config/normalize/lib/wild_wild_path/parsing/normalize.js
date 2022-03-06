import { getObjectTokenType } from '../tokens/main.js'

// Normalize paths of tokens.
// Alternative of paths are optional: we normalize to use the simpler optional
// syntax.
export const normalizePaths = function (paths) {
  const pathsA = paths.map(normalizePath)
  return pathsA.length === 1 ? pathsA[0] : pathsA
}

const normalizePath = function (path) {
  return path.map(normalizeToken)
}

const normalizeToken = function (token) {
  const tokenType = getObjectTokenType(token)
  return tokenType.normalize(token)
}
