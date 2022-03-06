import { MINUS } from './special.js'

// Check the type of a parsed token.
// Integers specified as string tokens are assumed to be property names, not
// array indices.
export const testObject = function (token) {
  return Number.isInteger(token)
}

// Serialize a token to a string
const serialize = function (token) {
  return Object.is(token, -0) ? '-0' : String(token)
}

// Check the type of a serialized token
const testString = function ({ chars, hasMinus }) {
  const hasEscapedMinus = chars[0] === MINUS && !hasMinus
  return !hasEscapedMinus && isIndexString(chars)
}

export const isIndexString = function (chars) {
  return INTEGER_REGEXP.test(chars)
}

const INTEGER_REGEXP = /^-?\d+$/u

// Parse a string into a token
const parse = function (chars) {
  return Number(chars)
}

// Normalize value after parsing or serializing
const normalize = function (token) {
  return token
}

// When the token is missing a target value, add a default one.
const isDefined = function (value) {
  return Array.isArray(value)
}

// Default value when token is missing
const defaultValue = []

// Use the token to list entries against a target value.
// eslint-disable-next-line max-params
const getEntries = function (value, path, token, defined) {
  const index = getArrayIndex(value, token)
  return [{ value: value[index], path: [...path, index], defined }]
}

// Retrieve an array using a positive or negative index.
// Indices that are out-of-bound:
//  - Do not error
//  - Return an entry with an `undefined` value
//     - This allows appending to arrays, e.g. with -0
export const getArrayIndex = function (value, token) {
  return token > 0 || Object.is(token, +0)
    ? token
    : Math.max(value.length + token, 0)
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
  normalize,
  isDefined,
  defaultValue,
  getEntries,
  equals,
}
