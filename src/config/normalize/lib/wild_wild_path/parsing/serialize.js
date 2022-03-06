import { TOKEN_SEPARATOR } from '../tokens/escape.js'
import { getObjectTokenType } from '../tokens/main.js'

import { parse } from './parse.js'

// Inverse of `parse()`
// When passing a query string, it is parsed and re-serialized to validate and
// normalize it.
export const serialize = function (queryOrPath) {
  const path = parse(queryOrPath)
  return serializePath(path)
}

const serializePath = function (path) {
  return path.map(serializeToken).join(TOKEN_SEPARATOR)
}

const serializeToken = function (token, index) {
  const tokenType = getObjectTokenType(token)
  return tokenType.serialize(token, index)
}