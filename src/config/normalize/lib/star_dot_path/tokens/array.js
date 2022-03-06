import { MINUS } from './special.js'

// Check the type of a parsed token.
// Integers specified as string tokens are assumed to be property names, not
// array indices.
const testObject = function (token) {
  return Number.isInteger(token)
}

// Serialize a token to a string
const serialize = function (token) {
  return Object.is(token, -0) ? '-0' : String(token)
}

// Check the type of a serialized token
const testString = function ({ chars, hasMinus }) {
  const hasEscapedMinus = chars[0] === MINUS && !hasMinus
  return !hasEscapedMinus && INTEGER_REGEXP.test(chars)
}

const INTEGER_REGEXP = /^-?\d+$/u

// Parse a string into a token
const parse = function (chars) {
  return Number(chars)
}

// When the token is missing a target value, add a default one.
const handleMissingValue = function (value) {
  const missing = !Array.isArray(value)
  const valueA = missing ? [] : value
  return { value: valueA, missing }
}

// Use the token to list entries against a target value.
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

// Check if two tokens are the same
const equals = function (tokenA, tokenB) {
  return Object.is(tokenA, tokenB)
}

export const ARRAY_TOKEN = {
  testObject,
  serialize,
  testString,
  parse,
  handleMissingValue,
  getEntries,
  equals,
}
