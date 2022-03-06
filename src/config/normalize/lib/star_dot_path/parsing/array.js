// Users can specify integers either:
//  - stringified for object properties
//     - those should also work for array indices for convenience, but this is
//       not documented
//  - left as is for array indices
// For convenience, we also support, but do not document, stringified integers
// as array indices.
// At query parsing time, without any target value, we do not know yet which
// intent it is:
//  - When a path was passed, we leave it as is
//  - When a query string was used instead, we assume it was meant as an array
//    index since those are much more common.
// We allow negative indexes which query from the end
//  - Including -0 which can be used to append values
// At evaluation time, with a target value, we transtype correctly.
export const convertIndexInteger = function (token) {
  return typeof token === 'string' && INTEGER_REGEXP.test(token)
    ? Number(token)
    : token
}

const INTEGER_REGEXP = /^-?\d+$/u

export const convertIndexString = function (token) {
  return isIndexToken(token) ? String(token) : token
}

// Retrieve an array using a positive or negative index.
// Indices that are out-of-bound return no entries but do not error.
export const getArrayIndex = function (array, token) {
  return token > 0 || Object.is(token, +0)
    ? token
    : Math.max(array.length + token, 0)
}

// Check if token is an array index integer
export const isIndexToken = function (token) {
  return Number.isInteger(token)
}
