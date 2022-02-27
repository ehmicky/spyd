import { isAnyToken } from './node.js'
import { SEPARATOR, ANY, SPECIAL_CHARS_REGEXP } from './special.js'

// Inverse of `parse()`
export const serialize = function (nodes) {
  return nodes.map(serializeNode).join(SEPARATOR)
}

const serializeNode = function (node, index) {
  return node.map((token) => serializeToken(token, index)).join('')
}

const serializeToken = function (token, index) {
  if (isAnyToken(token)) {
    return ANY
  }

  return serializePropToken(token, index)
}

const serializePropToken = function (token, index) {
  if (Number.isInteger(token)) {
    return String(token)
  }

  if (token === '' && index === 0) {
    return SEPARATOR
  }

  return token.replace(SPECIAL_CHARS_REGEXP, '\\$&')
}
