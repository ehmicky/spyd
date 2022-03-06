// Normalize a path of tokens
export const normalizePath = function (path) {
  return path.map(normalizeToken)
}

const normalizeToken = function (token) {
  return token
}
