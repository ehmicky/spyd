import { SEPARATOR, ANY, SPECIAL_CHARS_REGEXP } from './special.js'
import { isAnyPart, getPropPartValue } from './token.js'

// Inverse of `parse()`
export const serialize = function (tokens) {
  return tokens.map(serializeToken).join(SEPARATOR)
}

const serializeToken = function (token, index) {
  return token.map((part) => serializePart(part, index)).join('')
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
