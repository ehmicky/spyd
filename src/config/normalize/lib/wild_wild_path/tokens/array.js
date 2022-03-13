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
const testString = function (chars) {
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

// Use the token to list entries against a target value.
const iterate = function (value, token) {
  const index = getArrayIndex(value, token)
  return [{ value: value[index], prop: index, missing: index >= value.length }]
}

// Negative array indices start from the end.
// Indices that are out-of-bound:
//  - Do not error
//  - Are min-bounded to 0
//  - Are not max-bounded:
//     - Those return a missing entry instead
//     - Reasons:
//        - This is more consistent with how missing entries with property names
//          are handled
//        - This allows appending with -0
//        - This is better when setting values on arrays with varying sizes
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
  array: true,
  testObject,
  serialize,
  testString,
  parse,
  normalize,
  iterate,
  equals,
}
