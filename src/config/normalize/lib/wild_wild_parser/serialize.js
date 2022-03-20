import { normalizeQuery, normalizePath } from './normalize.js'
import { TOKEN_SEPARATOR, ARRAY_SEPARATOR } from './tokens/escape.js'
import { getObjectTokenType } from './tokens/main.js'

// Inverse of `parseQuery()`
// When passing a query string, it is parsed and re-serialized to validate and
// normalize it.
export const serializeQuery = function (query) {
  const queryArrays = normalizeQuery(query)
  return queryArrays.map(serializeQueryArray).join(ARRAY_SEPARATOR)
}

// Inverse of `parsePath()`
export const serializePath = function (query) {
  const path = normalizePath(query)
  return serializeQueryArray(path)
}

const serializeQueryArray = function (queryArray) {
  return queryArray.every(isEmptyToken)
    ? TOKEN_SEPARATOR.repeat(queryArray.length + 1)
    : queryArray.map(serializeToken).join(TOKEN_SEPARATOR)
}

const isEmptyToken = function (token) {
  return token === EMPTY_TOKEN
}

const EMPTY_TOKEN = ''

const serializeToken = function (token, index) {
  const tokenType = getObjectTokenType(token)
  return tokenType.serialize(token, index)
}
