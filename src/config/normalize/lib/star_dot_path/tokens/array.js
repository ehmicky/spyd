import { MINUS } from './special.js'

// Users can specify integers either:
//  - stringified for object properties
//  - left as is for array indices
// At query string parsing time, without any target value, we assume the intent
// was for arrays.
// We allow negative indexes which query from the end
//  - Including -0 which can be used to append values
// Check if token is an array index integer
const test = function (token) {
  return Number.isInteger(token)
}

// Serialize an array index token into a string
const serialize = function (token) {
  return Object.is(token, -0) ? '-0' : String(token)
}

// Check if a string should be parsed as an index token
const testChars = function ({ chars, hasMinus }) {
  const hasEscapedMinus = chars[0] === MINUS && !hasMinus
  return !hasEscapedMinus && INTEGER_REGEXP.test(chars)
}

const INTEGER_REGEXP = /^-?\d+$/u

// Parse an array index string into a token
const parse = function (chars) {
  return Number(chars)
}

// Default array when missing
const handleMissingValue = function (value) {
  const missing = !Array.isArray(value)
  const valueA = missing ? [] : value
  return { value: valueA, missing }
}

// List entries when using indices, e.g. `a.1`
const getEntries = function (value, path, token) {
  const index = getArrayIndex(value, token)
  return [{ value: value[index], path: [...path, index] }]
}

// Retrieve an array using a positive or negative index.
// Indices that are out-of-bound return no entries but do not error.
const getArrayIndex = function (array, token) {
  return token > 0 || Object.is(token, +0)
    ? token
    : Math.max(array.length + token, 0)
}

export const ARRAY_TOKEN = {
  test,
  serialize,
  testChars,
  parse,
  handleMissingValue,
  getEntries,
}
