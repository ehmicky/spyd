import { parse } from './parse.js'
import { isAnyToken } from './tokens/any.js'
import { isIndexToken, serializeIndexToken } from './tokens/array.js'
import { serializePropToken } from './tokens/prop.js'
import { isRegExpToken, serializeRegExpToken } from './tokens/regexp.js'
import { SEPARATOR, ANY } from './tokens/special.js'

// Inverse of `parse()`
// When passing a query string, it is parsed and re-serialized to validate and
// normalize it.
export const serialize = function (queryOrPath) {
  const path = parse(queryOrPath)
  return serializePath(path)
}

const serializePath = function (path) {
  return path.map(serializeToken).join(SEPARATOR)
}

const serializeToken = function (token, index) {
  if (isAnyToken(token)) {
    return ANY
  }

  if (isIndexToken(token)) {
    return serializeIndexToken(token)
  }

  if (isRegExpToken(token)) {
    return serializeRegExpToken(token)
  }

  return serializePropToken(token, index)
}
