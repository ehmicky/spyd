// Users can specify integers either:
//  - stringified for object properties
//  - left as is for array indices
// At query string parsing time, without any target value, we assume the intent
// was for arrays.
// We allow negative indexes which query from the end
//  - Including -0 which can be used to append values
// Check if token is an array index integer
export const isIndexToken = function (token) {
  return Number.isInteger(token)
}

// Serialize an array index token into a string
export const serializeIndexToken = function (token) {
  return Object.is(token, -0) ? '-0' : String(token)
}

// Check if a string should be parsed as an index token
export const hasIndex = function (chars, hasEscapedMinus) {
  return !hasEscapedMinus && INTEGER_REGEXP.test(chars)
}

const INTEGER_REGEXP = /^-?\d+$/u

// Parse an array index string into a token
export const parseIndexToken = function (chars) {
  return Number(chars)
}

// Retrieve an array using a positive or negative index.
// Indices that are out-of-bound return no entries but do not error.
export const getArrayIndex = function (array, token) {
  return token > 0 || Object.is(token, +0)
    ? token
    : Math.max(array.length + token, 0)
}
