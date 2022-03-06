import { isRecurseObject } from './recurse.js'
import { SEPARATOR, escapeSpecialChars } from './special.js'

// Check if a token is a property name string
export const isPropToken = function (token) {
  return typeof token === 'string'
}

// Serialize a property token into a string
export const serializePropToken = function (token, index) {
  return token === '' && index === 0 ? SEPARATOR : escapeSpecialChars(token)
}

// Parse a property string into a token
export const parsePropToken = function (chars) {
  return chars
}

// List entries when using property names, e.g. `a.b`
export const getPropEntries = function (value, path, token) {
  const { value: valueA, missing } = handlePropMissingValue(value, token)
  return [{ value: valueA[token], path: [...path, token], missing }]
}

// Default object when missing
export const handlePropMissingValue = function (value) {
  const missing = !isRecurseObject(value)
  const valueA = missing ? {} : value
  return { value: valueA, missing }
}
