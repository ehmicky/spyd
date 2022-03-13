import { TOKEN_SEPARATOR, ARRAY_SEPARATOR } from '../tokens/escape.js'
import { getObjectTokenType } from '../tokens/main.js'

import { parse, parsePath } from './parse.js'

// Inverse of `parse()`
// When passing a query string, it is parsed and re-serialized to validate and
// normalize it.
export const serialize = function (query) {
  const queryArrays = parse(query)
  return queryArrays.map(serializeQueryArray).join(ARRAY_SEPARATOR)
}

// Inverse of `parsePath()`
export const serializePath = function (query) {
  const path = parsePath(query)
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
