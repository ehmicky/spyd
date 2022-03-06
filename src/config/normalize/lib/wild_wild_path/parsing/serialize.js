import { TOKEN_SEPARATOR, PATH_SEPARATOR } from '../tokens/escape.js'
import { getObjectTokenType } from '../tokens/main.js'

import { parse } from './parse.js'

// Inverse of `parse()`
// When passing a query string, it is parsed and re-serialized to validate and
// normalize it.
export const serialize = function (queryOrPath) {
  const paths = parse(queryOrPath)
  return paths.map(serializePath).join(PATH_SEPARATOR)
}

const serializePath = function (path) {
  return path.every(isEmptyToken)
    ? TOKEN_SEPARATOR.repeat(path.length + 1)
    : path.map(serializeToken).join(TOKEN_SEPARATOR)
}

const isEmptyToken = function (token) {
  return token === ''
}

const serializeToken = function (token, index) {
  const tokenType = getObjectTokenType(token)
  return tokenType.serialize(token, index)
}
