import { isAnyToken } from './any.js'
import { isIndexToken, serializeIndexToken } from './array.js'
import { parse } from './parse.js'
import { isRegExpToken, serializeRegExpToken } from './regexp.js'
import { SEPARATOR, ANY, escapeSpecialChars } from './special.js'

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

  return serializeStringToken(token, index)
}

const serializeStringToken = function (token, index) {
  if (token === '' && index === 0) {
    return SEPARATOR
  }

  return escapeSpecialChars(token)
}
