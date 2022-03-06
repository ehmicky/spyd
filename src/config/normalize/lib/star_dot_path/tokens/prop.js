import { escapeSpecialChars } from './escape.js'
import { isRecurseObject } from './recurse.js'
import { SEPARATOR } from './special.js'

// Check if a token is a property name string
const test = function (token) {
  return typeof token === 'string'
}

// Serialize a property token into a string
const serialize = function (token, index) {
  return token === '' && index === 0 ? SEPARATOR : escapeSpecialChars(token)
}

const testChars = function () {
  return true
}

// Parse a property string into a token
const parse = function (chars) {
  return chars
}

// Default object when missing
const handleMissingValue = function (value) {
  const missing = !isRecurseObject(value)
  const valueA = missing ? {} : value
  return { value: valueA, missing }
}

// List entries when using property names, e.g. `a.b`
const getEntries = function (value, path, token) {
  return [{ value: value[token], path: [...path, token] }]
}

export const PROP_TOKEN = {
  test,
  serialize,
  testChars,
  parse,
  handleMissingValue,
  getEntries,
}
