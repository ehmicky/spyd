import { SEPARATOR, ANY, SPECIAL_CHARS_REGEXP } from './special.js'
import { isAnyPart } from './token.js'

// Inverse of `parse()`
export const serialize = function (tokens) {
  return tokens.map(serializeToken).join(SEPARATOR)
}

const serializeToken = function (token, index) {
  if (index === 0 && token[0] === '') {
    return SEPARATOR
  }

  return token.map(serializePart).join('')
}

const serializePart = function (part) {
  if (Number.isInteger(part)) {
    return String(part)
  }

  if (isAnyPart(part)) {
    return ANY
  }

  return part.replace(SPECIAL_CHARS_REGEXP, '\\$&')
}
