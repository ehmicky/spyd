import { getObjectTokenType } from '../tokens/main.js'

// Normalize a path of tokens
export const normalizePath = function (path) {
  return path.map(normalizeToken)
}

const normalizeToken = function (token) {
  const tokenType = getObjectTokenType(token)
  return tokenType.normalize(token)
}
