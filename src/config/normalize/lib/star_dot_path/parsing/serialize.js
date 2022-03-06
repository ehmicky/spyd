import { isIndexNode } from './path.js'
import { SEPARATOR, ANY, ANY_TOKEN, SPECIAL_CHARS_REGEXP } from './special.js'

// Inverse of `parse()`
export const serialize = function (path) {
  return path.map(serializeNode).join(SEPARATOR)
}

const serializeNode = function (node, index) {
  return Array.isArray(node)
    ? node.map((token) => serializeToken(token, index)).join('')
    : serializeToken(node, 0)
}

const serializeToken = function (token, index) {
  if (token === ANY_TOKEN) {
    return ANY
  }

  if (isIndexNode(token)) {
    return String(token)
  }

  if (typeof token === 'symbol') {
    throw new TypeError(`Cannot serialize ${String(token)}.`)
  }

  return serializeTokenString(token, index)
}

const serializeTokenString = function (token, index) {
  if (token === '' && index === 0) {
    return SEPARATOR
  }

  return token.replace(SPECIAL_CHARS_REGEXP, '\\$&')
}
