import { parse } from './parse.js'
import { SEPARATOR, ANY, ANY_TOKEN, SPECIAL_CHARS_REGEXP } from './special.js'
import { isIndexToken } from './validate.js'

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
  if (token === ANY_TOKEN) {
    return ANY
  }

  if (Object.is(token, -0)) {
    return '-0'
  }

  if (isIndexToken(token)) {
    return String(token)
  }

  return serializeTokenString(token, index)
}

const serializeTokenString = function (token, index) {
  if (token === '' && index === 0) {
    return SEPARATOR
  }

  return token.replace(SPECIAL_CHARS_REGEXP, '\\$&')
}
