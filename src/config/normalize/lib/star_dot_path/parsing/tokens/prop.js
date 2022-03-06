import { SEPARATOR, escapeSpecialChars } from './special.js'

// Check if a token is a property name string
export const isPropToken = function (token) {
  return typeof token === 'string'
}

// Serialize a property token into a string
export const serializePropToken = function (token, index) {
  return token === '' && index === 0 ? SEPARATOR : escapeSpecialChars(token)
}
