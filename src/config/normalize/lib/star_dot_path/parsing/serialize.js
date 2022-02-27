import { isAnyPart, getPropPartValue } from './node.js'
import { SEPARATOR, ANY, SPECIAL_CHARS_REGEXP } from './special.js'

// Inverse of `parse()`
export const serialize = function (nodes) {
  return nodes.map(serializeNode).join(SEPARATOR)
}

const serializeNode = function (node, index) {
  return node.map((part) => serializePart(part, index)).join('')
}

const serializePart = function (part, index) {
  if (isAnyPart(part)) {
    return ANY
  }

  return serializePropPart(part, index)
}

const serializePropPart = function (part, index) {
  const value = getPropPartValue(part)

  if (Number.isInteger(value)) {
    return String(value)
  }

  if (value === '' && index === 0) {
    return SEPARATOR
  }

  return value.replace(SPECIAL_CHARS_REGEXP, '\\$&')
}
